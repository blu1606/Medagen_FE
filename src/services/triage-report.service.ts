import { logger } from '../utils/logger.js';
import { LocationService } from './location.service.js';
import { PDFExportService } from './pdf-export.service.js';
import { ConversationHistoryService } from './conversation-history.service.js';
import type {
  CompleteTriageReport,
  TriageResult,
  TriageLevel,
  Location,
  ActionTimeline,
  FollowUpChecklist
} from '../types/index.js';

export class TriageReportService {
  private locationService: LocationService;
  private pdfService: PDFExportService;
  private conversationService: ConversationHistoryService;

  constructor(
    locationService: LocationService,
    pdfService: PDFExportService,
    conversationService: ConversationHistoryService
  ) {
    this.locationService = locationService;
    this.pdfService = pdfService;
    this.conversationService = conversationService;
  }

  /**
   * Generate complete triage report from conversation context
   */
  async generateCompleteReport(
    sessionId: string,
    triageResult: TriageResult,
    userLocation?: Location
  ): Promise<CompleteTriageReport> {
    try {
      logger.info(`Generating complete triage report for session: ${sessionId}`);

      // Generate report ID
      const reportId = this.generateReportId();

      // 1. Get nearby medical facilities
      logger.info('Fetching nearby medical facilities...');
      const nearbyFacilities = await this.locationService.findNearbyFacilities(
        userLocation,
        triageResult.triage_level,
        5 // Limit to 5 facilities
      );

      // 2. Generate follow-up checklist and timeline
      logger.info('Generating follow-up checklist and timeline...');
      const followUp = this.generateFollowUp(triageResult);

      // 3. Prepare PDF export metadata
      logger.info('Preparing PDF export metadata...');
      // Create temporary complete report for PDF service
      const tempReport: CompleteTriageReport = {
        ...triageResult,
        report_type: 'complete',
        nearby_facilities: nearbyFacilities,
        pdf_export: { available: false },
        follow_up: followUp,
        metadata: {
          generated_at: new Date().toISOString(),
          report_id: reportId,
          session_id: sessionId,
          has_sufficient_info: true
        }
      };

      const pdfExport = await this.pdfService.preparePDFExport(tempReport);

      // 4. Build complete report
      const completeReport: CompleteTriageReport = {
        ...triageResult,
        report_type: 'complete',
        nearby_facilities: nearbyFacilities,
        pdf_export: pdfExport,
        follow_up: followUp,
        metadata: {
          generated_at: new Date().toISOString(),
          report_id: reportId,
          session_id: sessionId,
          has_sufficient_info: this.hasSufficientInfo(triageResult)
        }
      };

      logger.info(`Complete triage report generated: ${reportId}`);
      return completeReport;
    } catch (error) {
      logger.error({ error }, 'Error generating complete triage report');
      throw error;
    }
  }

  /**
   * Extract triage data from conversation history
   */
  async extractTriageDataFromSession(
    sessionId: string,
    messageId?: string
  ): Promise<TriageResult | null> {
    try {
      logger.info(`Extracting triage data from session: ${sessionId}, message: ${messageId || 'latest'}`);

      const history = await this.conversationService.getHistory(sessionId, 20);

      if (history.length === 0) {
        logger.warn('No conversation history found');
        return null;
      }

      // Find the specific message or get the latest assistant message with triage_result
      let targetMessage = null;
      if (messageId) {
        targetMessage = history.find(msg => msg.id === messageId && msg.triage_result);
      } else {
        // Get latest assistant message with triage_result
        targetMessage = history
          .filter(msg => msg.role === 'assistant' && msg.triage_result)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      }

      if (!targetMessage || !targetMessage.triage_result) {
        logger.warn('No triage result found in conversation history');
        return null;
      }

      logger.info(`Found triage data from message: ${targetMessage.id}`);
      return targetMessage.triage_result as TriageResult;
    } catch (error) {
      logger.error({ error }, 'Error extracting triage data from session');
      return null;
    }
  }

  /**
   * Generate follow-up checklist and timeline based on triage result
   */
  private generateFollowUp(triageResult: TriageResult): FollowUpChecklist {
    const checklist: string[] = [];
    const warningSignsMonitor: string[] = [];

    // Generate checklist based on triage level
    switch (triageResult.triage_level) {
      case 'emergency':
        checklist.push('☐ Đã gọi 115 hoặc đến cơ sở cấp cứu');
        checklist.push('☐ Đã thông báo cho người thân');
        checklist.push('☐ Đã chuẩn bị thông tin y tế cần thiết');
        warningSignsMonitor.push(...triageResult.red_flags);
        break;

      case 'urgent':
        checklist.push('☐ Đã đặt lịch khám trong 24 giờ');
        checklist.push('☐ Đã chuẩn bị danh sách triệu chứng');
        checklist.push('☐ Đã chuẩn bị thông tin y tế (tiền sử, thuốc đang dùng)');
        warningSignsMonitor.push(...triageResult.red_flags);
        break;

      case 'routine':
        checklist.push('☐ Đã đặt lịch khám khi có thể');
        checklist.push('☐ Đã ghi chú các triệu chứng');
        checklist.push('☐ Đã theo dõi diễn biến triệu chứng');
        break;

      case 'self-care':
        checklist.push('☐ Đã thực hiện các biện pháp chăm sóc tại nhà');
        checklist.push('☐ Đã theo dõi diễn biến');
        checklist.push('☐ Đã ghi chú nếu triệu chứng thay đổi');
        break;
    }

    // Generate timeline based on triage level
    const timeline: ActionTimeline = this.generateTimeline(triageResult);

    return {
      checklist,
      timeline,
      warning_signs_monitor: warningSignsMonitor
    };
  }

  /**
   * Generate action timeline based on triage result
   */
  private generateTimeline(triageResult: TriageResult): ActionTimeline {
    const recommendation = triageResult.recommendation;

    switch (triageResult.triage_level) {
      case 'emergency':
        return {
          immediate: recommendation.action || 'Gọi 115 hoặc đến cơ sở cấp cứu ngay lập tức',
          within_hours: 'Đánh giá ban đầu tại cơ sở y tế, xét nghiệm cần thiết',
          within_days: 'Theo dõi tại bệnh viện, điều trị theo chỉ định',
          follow_up: 'Tái khám theo lịch hẹn của bác sĩ'
        };

      case 'urgent':
        return {
          immediate: recommendation.action || 'Đến cơ sở y tế trong vòng 24 giờ',
          within_hours: 'Khám và đánh giá tại cơ sở y tế',
          within_days: 'Theo dõi diễn biến, tuân thủ điều trị',
          follow_up: 'Tái khám theo chỉ định của bác sĩ'
        };

      case 'routine':
        return {
          immediate: recommendation.action || 'Đặt lịch khám khi có thể',
          within_hours: 'Chuẩn bị thông tin y tế cần thiết',
          within_days: 'Đến khám tại cơ sở y tế',
          follow_up: 'Tái khám nếu cần thiết'
        };

      case 'self-care':
        return {
          immediate: recommendation.action || 'Thực hiện chăm sóc tại nhà',
          within_hours: 'Theo dõi diễn biến triệu chứng',
          within_days: 'Tiếp tục chăm sóc, nếu không cải thiện thì đi khám',
          follow_up: 'Đi khám nếu triệu chứng không cải thiện hoặc nặng hơn'
        };

      default:
        return {
          immediate: recommendation.action || 'Theo dõi triệu chứng',
          within_hours: 'Chuẩn bị thông tin y tế',
          within_days: 'Đến khám nếu cần',
          follow_up: 'Tái khám theo chỉ định'
        };
    }
  }

  /**
   * Check if triage result has sufficient information for complete report
   */
  private hasSufficientInfo(triageResult: TriageResult): boolean {
    // Consider sufficient if:
    // 1. Has symptom summary
    // 2. Has recommendation
    // 3. Not just a routine educational query
    const hasSymptomSummary = triageResult.symptom_summary && triageResult.symptom_summary.trim().length > 0;
    const hasRecommendation = triageResult.recommendation && triageResult.recommendation.action;
    const isNotJustRoutine = triageResult.triage_level !== 'routine' || 
                            triageResult.suspected_conditions.length > 0 ||
                            triageResult.red_flags.length > 0;

    return hasSymptomSummary && hasRecommendation && isNotJustRoutine;
  }

  /**
   * Generate unique report ID
   */
  private generateReportId(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TR-${dateStr}-${randomStr}`;
  }
}

