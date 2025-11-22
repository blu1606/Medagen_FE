import axios from 'axios';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import type { MedicalFacility, Location, TriageLevel } from '../types/index.js';

export class LocationService {
  /**
   * Find nearby medical facilities based on location and triage level
   */
  async findNearbyFacilities(
    location: Location | undefined,
    triageLevel: TriageLevel,
    limit: number = 5
  ): Promise<MedicalFacility[]> {
    if (!location) {
      logger.warn('No location provided, returning empty facilities list');
      return [];
    }

    if (!config.googleMaps.apiKey) {
      logger.warn('Google Maps API key not configured');
      return [];
    }

    try {
      logger.info(`Finding nearby facilities for triage level: ${triageLevel}`);

      // Determine search keywords based on triage level
      const keywords = this.getSearchKeywords(triageLevel);
      const radius = this.getSearchRadius(triageLevel);

      const facilities: MedicalFacility[] = [];

      // Search for each keyword type
      for (const keyword of keywords) {
        try {
          const response = await axios.get(
            'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
            {
              params: {
                location: `${location.lat},${location.lng}`,
                radius: radius,
                keyword: keyword,
                language: 'vi',
                key: config.googleMaps.apiKey
              }
            }
          );

          if (response.data.results && response.data.results.length > 0) {
            for (const place of response.data.results) {
              // Skip if already added
              if (facilities.some(f => f.name === place.name)) {
                continue;
              }

              const distance = this.calculateDistance(
                location.lat,
                location.lng,
                place.geometry.location.lat,
                place.geometry.location.lng
              );

              const facility: MedicalFacility = {
                name: place.name,
                address: place.vicinity || place.formatted_address || 'Địa chỉ không có',
                distance_km: Math.round(distance * 10) / 10,
                facility_type: this.determineFacilityType(place, triageLevel),
                phone: place.formatted_phone_number || undefined,
                coordinates: {
                  lat: place.geometry.location.lat,
                  lng: place.geometry.location.lng
                },
                capabilities: this.extractCapabilities(place),
                working_hours: place.opening_hours?.weekday_text?.join(', ') || undefined,
                accepts_emergency: this.checkAcceptsEmergency(place, triageLevel)
              };

              facilities.push(facility);

              // Stop if we have enough facilities
              if (facilities.length >= limit) {
                break;
              }
            }
          }
        } catch (error) {
          logger.warn({ error, keyword }, `Failed to search for keyword: ${keyword}`);
          // Continue with next keyword
        }

        if (facilities.length >= limit) {
          break;
        }
      }

      // Sort by distance
      facilities.sort((a, b) => a.distance_km - b.distance_km);

      logger.info(`Found ${facilities.length} nearby facilities`);
      return facilities.slice(0, limit);
    } catch (error) {
      logger.error({ error }, 'Error finding nearby facilities');
      return [];
    }
  }

  /**
   * Get search keywords based on triage level
   */
  private getSearchKeywords(triageLevel: TriageLevel): string[] {
    switch (triageLevel) {
      case 'emergency':
        return [
          'bệnh viện cấp cứu',
          'bệnh viện có khoa cấp cứu',
          'trung tâm cấp cứu',
          'bệnh viện đa khoa'
        ];
      case 'urgent':
        return [
          'bệnh viện',
          'phòng khám đa khoa',
          'trung tâm y tế',
          'bệnh viện đa khoa'
        ];
      case 'routine':
        return [
          'phòng khám',
          'phòng khám đa khoa',
          'trung tâm y tế',
          'bệnh viện'
        ];
      case 'self-care':
        return [
          'phòng khám',
          'nhà thuốc',
          'trung tâm y tế'
        ];
      default:
        return ['bệnh viện', 'phòng khám'];
    }
  }

  /**
   * Get search radius based on triage level (in meters)
   */
  private getSearchRadius(triageLevel: TriageLevel): number {
    switch (triageLevel) {
      case 'emergency':
        return 10000; // 10km for emergency
      case 'urgent':
        return 15000; // 15km for urgent
      case 'routine':
        return 20000; // 20km for routine
      case 'self-care':
        return 10000; // 10km for self-care
      default:
        return 15000; // 15km default
    }
  }

  /**
   * Determine facility type from Google Places result
   */
  private determineFacilityType(place: any, triageLevel: TriageLevel): MedicalFacility['facility_type'] {
    const name = (place.name || '').toLowerCase();
    const types = place.types || [];

    // Check for emergency facilities
    if (name.includes('cấp cứu') || name.includes('emergency') || 
        types.includes('hospital') && triageLevel === 'emergency') {
      return 'emergency';
    }

    // Check for hospital
    if (name.includes('bệnh viện') || name.includes('hospital') || 
        types.includes('hospital')) {
      return 'hospital';
    }

    // Check for clinic
    if (name.includes('phòng khám') || name.includes('clinic') || 
        types.includes('doctor') || types.includes('pharmacy')) {
      return 'clinic';
    }

    // Default
    return 'clinic';
  }

  /**
   * Extract capabilities from Google Places result
   */
  private extractCapabilities(place: any): string[] {
    const capabilities: string[] = [];
    const name = (place.name || '').toLowerCase();
    const types = place.types || [];

    if (name.includes('cấp cứu') || types.includes('hospital')) {
      capabilities.push('Cấp cứu 24/7');
    }

    if (name.includes('đa khoa') || types.includes('hospital')) {
      capabilities.push('Đa khoa');
    }

    if (name.includes('tim mạch') || name.includes('cardiology')) {
      capabilities.push('Khoa Tim mạch');
    }

    if (name.includes('da liễu') || name.includes('dermatology')) {
      capabilities.push('Khoa Da liễu');
    }

    if (name.includes('mắt') || name.includes('eye') || name.includes('ophthalmology')) {
      capabilities.push('Khoa Mắt');
    }

    if (types.includes('hospital')) {
      capabilities.push('Bệnh viện');
    }

    if (types.includes('pharmacy')) {
      capabilities.push('Nhà thuốc');
    }

    return capabilities.length > 0 ? capabilities : ['Dịch vụ y tế'];
  }

  /**
   * Check if facility accepts emergency cases
   */
  private checkAcceptsEmergency(place: any, triageLevel: TriageLevel): boolean {
    if (triageLevel !== 'emergency') {
      return false;
    }

    const name = (place.name || '').toLowerCase();
    const types = place.types || [];

    return name.includes('cấp cứu') || 
           name.includes('emergency') || 
           types.includes('hospital');
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

