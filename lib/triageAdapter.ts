import { CompleteTriageReport, TriageResult, MedicalFacility, ActionTimeline } from './api/types';

export const generateCompleteReport = (triageResult: TriageResult, sessionId: string): CompleteTriageReport => {
    // Mock location data
    const mockFacilities: MedicalFacility[] = [
        {
            name: "Bệnh viện Chợ Rẫy",
            address: "201B Nguyễn Chí Thanh, Quận 5, TP.HCM",
            distance_km: 2.3,
            facility_type: "emergency",
            phone: "028 3855 4137",
            coordinates: { lat: 10.7546, lng: 106.6639 },
            capabilities: ["Cấp cứu 24/7", "Khoa Tim mạch", "ICU", "Phẫu thuật tim"],
            working_hours: "24/7",
            accepts_emergency: true
        },
        {
            name: "Bệnh viện Đại học Y Dược TP.HCM",
            address: "215 Hồng Bàng, Quận 5, TP.HCM",
            distance_km: 2.8,
            facility_type: "emergency",
            phone: "028 3855 2010",
            coordinates: { lat: 10.7584, lng: 106.6571 },
            capabilities: ["Cấp cứu 24/7", "Khoa Tim mạch", "ICU"],
            working_hours: "24/7",
            accepts_emergency: true
        }
    ];

    // Mock timeline based on triage level
    const getTimeline = (level: string): ActionTimeline => {
        switch (level) {
            case 'emergency':
                return {
                    immediate: "Gọi 115 NGAY - Không tự đi",
                    within_hours: "Đánh giá cấp cứu tại bệnh viện",
                    within_days: "Nhập viện điều trị",
                    follow_up: "Theo chỉ định của bác sĩ"
                };
            case 'urgent':
                return {
                    immediate: "Sắp xếp đi khám ngay",
                    within_hours: "Đến cơ sở y tế gần nhất",
                    within_days: "Theo dõi triệu chứng",
                    follow_up: "Tái khám sau 3 ngày nếu không đỡ"
                };
            case 'routine':
                return {
                    immediate: "Theo dõi tại nhà",
                    within_hours: "Nghỉ ngơi, uống đủ nước",
                    within_days: "Đặt lịch khám nếu cần",
                    follow_up: "Khám định kỳ"
                };
            default:
                return {
                    immediate: "Tự chăm sóc",
                    within_hours: "Theo dõi",
                    within_days: "Duy trì lối sống lành mạnh",
                    follow_up: "Không cần thiết"
                };
        }
    };

    return {
        ...triageResult,
        report_type: 'complete',
        nearby_facilities: mockFacilities,
        pdf_export: {
            available: true,
            download_url: "#", // Mock URL
            qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MedagenReport", // Mock QR
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        follow_up: {
            checklist: [
                "Theo dõi nhiệt độ cơ thể 4h/lần",
                "Ghi lại các triệu chứng bất thường",
                "Tuân thủ hướng dẫn dùng thuốc",
                "Liên hệ bác sĩ nếu có dấu hiệu trở nặng"
            ],
            timeline: getTimeline(triageResult.triage_level),
            warning_signs_monitor: [
                "Khó thở tăng dần",
                "Đau ngực không giảm",
                "Sốt cao không hạ",
                "Mất ý thức hoặc lơ mơ"
            ]
        },
        metadata: {
            generated_at: new Date().toISOString(),
            report_id: `TR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            has_sufficient_info: true
        }
    };
};
