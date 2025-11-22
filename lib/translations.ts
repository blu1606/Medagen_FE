export const translations = {
    en: {
        nav: {
            features: "Features",
            howItWorks: "How It Works",
            solutions: "Solutions",
            pricing: "Pricing",
            login: "Login",
            signUp: "Sign Up",
            getStarted: "Get Started",
        },
        hero: {
            badge: "AI-Powered Health Triage Available 24/7",
            title: "Get Instant Health Guidance When You Need It Most",
            description: "Advanced AI triage to help you decide if you need emergency care, a doctor's visit, or self-care at home. Available 24/7 with clinical accuracy you can trust.",
            startAssessment: "Start Free Assessment",
            learnMore: "Learn How It Works",
            meetCustomers: "Meet Our Customers",
        },
        features: {
            title: "Advanced AI Health Triage",
            subtitle: "Powered by cutting-edge medical AI and verified clinical guidelines",
            available: {
                title: "Available 24/7",
                description: "Get instant health guidance any time of day or night. No waiting rooms, no appointments needed.",
            },
            accuracy: {
                title: "Clinical Accuracy",
                description: "Backed by advanced medical LLMs and validated against clinical triage protocols for reliable assessments.",
            },
            privacy: {
                title: "Private & Secure",
                description: "Your health data is encrypted with AES-256 and protected. We prioritize patient privacy and HIPAA compliance.",
            },
        },
        howItWorks: {
            title: "How It Works",
            subtitle: "Get accurate health guidance in three simple steps",
            step1: {
                title: "Describe Your Symptoms",
                description: "Tell us what's bothering you, select affected body parts, and rate your pain level.",
                benefits: [
                    "Interactive body map selection",
                    "Symptom severity assessment",
                    "Medical history integration",
                ],
            },
            step2: {
                title: "AI Analysis",
                description: "Our medical AI analyzes your symptoms against clinical guidelines and medical databases.",
                benefits: [
                    "Evidence-based triage algorithms",
                    "Real-time clinical assessment",
                    "Pattern recognition from millions of cases",
                ],
            },
            step3: {
                title: "Get Recommendations",
                description: "Receive personalized triage recommendations with nearby healthcare facilities and next steps.",
                benefits: [
                    "Emergency vs. urgent care guidance",
                    "Nearest facility locations",
                    "Self-care instructions for minor issues",
                ],
            },
        },
        solutions: {
            title: "Smart Triage for Better Healthcare Decisions",
            description: "Medagen uses advanced medical AI to help you make informed decisions about your health. Whether it's an emergency, urgent care need, or something you can manage at home, we provide clear guidance.",
            emergency: {
                title: "Emergency Detection",
                description: "Identifies critical symptoms requiring immediate medical attention",
            },
            facilities: {
                title: "Nearby Facilities",
                description: "Locates the nearest appropriate healthcare facilities for your needs",
            },
            selfCare: {
                title: "Self-Care Guidance",
                description: "Provides home care advice for minor ailments and symptoms",
            },
            realTime: {
                title: "Real-Time Triage",
                description: "Instant AI-powered analysis",
            },
        },
        cta: {
            title: "Ready to Get Started?",
            description: "Start your free health assessment now. No registration required.",
            button: "Start Free Assessment",
            disclaimer: "Medical Disclaimer: Medagen is an AI assistant for health triage guidance only. It does not replace professional medical advice, diagnosis, or treatment. In case of emergency, call your local emergency number immediately.",
        },
        footer: {
            description: "AI-powered health triage for instant, accurate medical guidance.",
            product: "Product",
            company: "Company",
            legal: "Legal",
            about: "About Us",
            privacy: "Privacy Policy",
            terms: "Terms of Service",
            contact: "Contact",
            hipaa: "HIPAA Compliance",
            medicalDisclaimer: "Medical Disclaimer",
            security: "Security",
            rights: "All rights reserved.",
        },
        pricing: {
            title: "Simple, Transparent Pricing",
            description: "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
            monthly: "billed monthly",
            annually: "billed annually",
            save: "Save 20%",
            annualBilling: "Annual billing",
            popular: "Popular",
            perMonth: "month",
            plans: {
                basic: {
                    name: "Basic",
                    description: "Essential features for individuals",
                    button: "Get Started",
                    features: [
                        "Basic AI Triage",
                        "Symptom Checker",
                        "Email Support"
                    ]
                },
                pro: {
                    name: "Pro",
                    description: "Advanced features for families",
                    button: "Get Started",
                    features: [
                        "Advanced AI Analysis",
                        "Priority Support",
                        "Family Profiles",
                        "History Tracking"
                    ]
                },
                enterprise: {
                    name: "Enterprise",
                    description: "Complete solution for organizations",
                    button: "Contact Sales",
                    features: [
                        "Custom Integration",
                        "Dedicated Account Manager",
                        "SLA Support",
                        "Analytics Dashboard"
                    ]
                }
            }
        },
        intake: {
            steps: {
                triage: "Triage",
                complaint: "Complaint",
                details: "Details"
            },
            triage: {
                title: "Let's check the urgency first",
                subtitle: "Select the option that best describes your situation.",
                emergency: {
                    title: "Emergency",
                    description: "Severe pain, bleeding, difficulty breathing, or loss of consciousness."
                },
                urgent: {
                    title: "Urgent",
                    description: "Need help today. High fever, infection signs, or sudden illness."
                },
                routine: {
                    title: "General Health",
                    description: "Routine check-up, mild symptoms, or general questions."
                }
            },
            complaint: {
                title: "What's bothering you today?",
                subtitle: "Briefly describe your main symptom.",
                placeholder: "e.g., Severe headache behind eyes",
                uploadImage: "Upload Image (Optional)",
                addPhoto: "Add photo of symptom",
                next: "Next",
                back: "Back"
            },
            details: {
                title: "Where does it hurt?",
                subtitle: "Tap on the body map to select areas.",
                duration: {
                    label: "How long have you had this?",
                    options: {
                        today: "Today",
                        days: "2-3 Days",
                        week: "A Week",
                        longer: "Longer"
                    }
                },
                painLevel: "Pain Level (1-10)",
                startAssessment: "Start Assessment",
                creatingSession: "Creating Session..."
            }
        },
        chat: {
            header: {
                title: "Chat Consultation",
                session: "Session",
                new: "New",
                newAssessment: "New Assessment",
                export: "Export Conversation",
                exportComingSoon: "Export functionality coming soon"
            },
            input: {
                placeholder: "Type your message...",
                send: "Send"
            },
            thinking: {
                analyzing: "Analyzing symptoms...",
                checking: "Checking medical guidelines...",
                formulating: "Formulating response...",
                default: "AI is analyzing..."
            },
            welcome: "Hello! I've reviewed your information. Let me ask a few follow-up questions to better understand your condition. Can you tell me more about what you're feeling?",
            assessment: {
                pending: "Assessment Update Pending",
                areas: "areas",
                pain: "Pain",
                duration: "Duration",
                noDuration: "No duration",
                send: "Send Update"
            },
            triage: {
                title: "Your Triage Result",
                quickActions: "Quick Actions",
                findClinics: "Find Clinics",
                bookAppointment: "Book Appointment",
                emailDoctor: "Email to Doctor",
                downloadPdf: "Download PDF",
                generating: "Generating...",
                callEmergency: "Call Emergency (911)",
                whileYouWait: "While You Wait",
                share: "Share",
                exportResult: "Export Result",
                exporting: "Exporting...",
                startNew: "Start New Assessment",
                clinicToast: "Opening nearby clinics...",
                clinicDesc: "This feature will show clinics based on your location",
                appointmentToast: "Opening appointment booking...",
                appointmentDesc: "Connect with healthcare providers in your area",
                emailToast: "Email prepared!",
                emailDesc: "Opening your email client with the report",
                downloadToast: "Report downloaded!",
                downloadDesc: "Check your downloads folder",
                shareTitle: "Medagen Health Report",
                shareToast: "Link copied to clipboard!"
            },
            quickReplies: {
                label: "Quick replies",
                pain: {
                    throbbing: "Yes, it's throbbing",
                    dull: "No, it's a dull ache",
                    comesAndGoes: "It comes and goes",
                    constant: "It's constant"
                },
                duration: {
                    today: "Just started today",
                    fewDays: "2-3 days ago",
                    week: "About a week",
                    moreThanWeek: "More than a week"
                },
                progression: {
                    worse: "Getting worse",
                    same: "About the same",
                    better: "Getting better",
                    unsure: "Not sure"
                },
                medication: {
                    paracetamol: "Yes, paracetamol",
                    ibuprofen: "Yes, ibuprofen",
                    none: "No medication yet",
                    regular: "I take regular medication"
                },
                headache: {
                    behindEyes: "Behind my eyes",
                    wholeHead: "Whole head",
                    oneSide: "One side only",
                    backOfHead: "Back of head"
                },
                fever: {
                    high: "Yes, high fever",
                    mild: "Mild fever",
                    none: "No fever",
                    unsure: "Not sure"
                },
                initial: {
                    tellMore: "Tell me more",
                    whatToDo: "What should I do?",
                    worried: "I'm worried",
                    serious: "Is this serious?"
                },
                default: {
                    yes: "Yes",
                    no: "No",
                    notSure: "I'm not sure",
                    explain: "Can you explain more?"
                }
            }
        }
    },
    vi: {
        nav: {
            features: "Tính năng",
            howItWorks: "Cách hoạt động",
            solutions: "Giải pháp",
            pricing: "Bảng giá",
            login: "Đăng nhập",
            signUp: "Đăng ký",
            getStarted: "Bắt đầu ngay",
        },
        hero: {
            badge: "Hỗ trợ y tế AI 24/7",
            title: "Nhận tư vấn sức khỏe ngay lập tức khi bạn cần nhất",
            description: "Phân loại bệnh bằng AI tiên tiến giúp bạn quyết định xem có cần cấp cứu, đi khám bác sĩ hay tự chăm sóc tại nhà. Hoạt động 24/7 với độ chính xác lâm sàng đáng tin cậy.",
            startAssessment: "Bắt đầu đánh giá miễn phí",
            learnMore: "Tìm hiểu cách hoạt động",
            meetCustomers: "Khách hàng của chúng tôi",
        },
        features: {
            title: "Phân loại sức khỏe AI tiên tiến",
            subtitle: "Được hỗ trợ bởi AI y tế tiên tiến và các hướng dẫn lâm sàng đã được kiểm chứng",
            available: {
                title: "Hoạt động 24/7",
                description: "Nhận hướng dẫn sức khỏe tức thì bất kể ngày đêm. Không cần phòng chờ, không cần hẹn trước.",
            },
            accuracy: {
                title: "Độ chính xác lâm sàng",
                description: "Được hỗ trợ bởi các mô hình ngôn ngữ y tế tiên tiến và được xác thực dựa trên các quy trình phân loại lâm sàng.",
            },
            privacy: {
                title: "Riêng tư & Bảo mật",
                description: "Dữ liệu sức khỏe của bạn được mã hóa bằng AES-256 và bảo vệ. Chúng tôi ưu tiên quyền riêng tư của bệnh nhân và tuân thủ HIPAA.",
            },
        },
        howItWorks: {
            title: "Cách hoạt động",
            subtitle: "Nhận hướng dẫn sức khỏe chính xác trong 3 bước đơn giản",
            step1: {
                title: "Mô tả triệu chứng",
                description: "Hãy cho chúng tôi biết bạn đang gặp vấn đề gì, chọn các bộ phận cơ thể bị ảnh hưởng và đánh giá mức độ đau.",
                benefits: [
                    "Bản đồ cơ thể tương tác",
                    "Đánh giá mức độ nghiêm trọng",
                    "Tích hợp lịch sử y tế",
                ],
            },
            step2: {
                title: "AI Phân tích",
                description: "AI y tế của chúng tôi phân tích các triệu chứng của bạn dựa trên các hướng dẫn lâm sàng và cơ sở dữ liệu y tế.",
                benefits: [
                    "Thuật toán phân loại dựa trên bằng chứng",
                    "Đánh giá lâm sàng thời gian thực",
                    "Nhận dạng mẫu từ hàng triệu ca bệnh",
                ],
            },
            step3: {
                title: "Nhận khuyến nghị",
                description: "Nhận các khuyến nghị phân loại được cá nhân hóa với các cơ sở y tế gần đó và các bước tiếp theo.",
                benefits: [
                    "Hướng dẫn cấp cứu vs chăm sóc khẩn cấp",
                    "Vị trí cơ sở y tế gần nhất",
                    "Hướng dẫn tự chăm sóc cho các vấn đề nhỏ",
                ],
            },
        },
        solutions: {
            title: "Phân loại thông minh cho quyết định y tế tốt hơn",
            description: "Medagen sử dụng AI y tế tiên tiến để giúp bạn đưa ra quyết định sáng suốt về sức khỏe của mình. Cho dù đó là trường hợp khẩn cấp, nhu cầu chăm sóc khẩn cấp hay thứ gì đó bạn có thể quản lý tại nhà, chúng tôi cung cấp hướng dẫn rõ ràng.",
            emergency: {
                title: "Phát hiện khẩn cấp",
                description: "Xác định các triệu chứng nghiêm trọng cần được chăm sóc y tế ngay lập tức",
            },
            facilities: {
                title: "Cơ sở lân cận",
                description: "Định vị các cơ sở y tế phù hợp gần nhất cho nhu cầu của bạn",
            },
            selfCare: {
                title: "Hướng dẫn tự chăm sóc",
                description: "Cung cấp lời khuyên chăm sóc tại nhà cho các bệnh nhẹ và triệu chứng",
            },
            realTime: {
                title: "Phân loại thời gian thực",
                description: "Phân tích tức thì bằng AI",
            },
        },
        cta: {
            title: "Sẵn sàng bắt đầu?",
            description: "Bắt đầu đánh giá sức khỏe miễn phí của bạn ngay bây giờ. Không cần đăng ký.",
            button: "Bắt đầu đánh giá miễn phí",
            disclaimer: "Tuyên bố từ chối trách nhiệm y tế: Medagen là trợ lý AI chỉ để hướng dẫn phân loại sức khỏe. Nó không thay thế cho lời khuyên y tế chuyên nghiệp, chẩn đoán hoặc điều trị. Trong trường hợp khẩn cấp, hãy gọi ngay cho số điện thoại khẩn cấp địa phương của bạn.",
        },
        footer: {
            description: "Phân loại sức khỏe bằng AI để có hướng dẫn y tế tức thì, chính xác.",
            product: "Sản phẩm",
            company: "Công ty",
            legal: "Pháp lý",
            about: "Về chúng tôi",
            privacy: "Chính sách bảo mật",
            terms: "Điều khoản dịch vụ",
            contact: "Liên hệ",
            hipaa: "Tuân thủ HIPAA",
            medicalDisclaimer: "Tuyên bố miễn trừ trách nhiệm y tế",
            security: "Bảo mật",
            rights: "Đã đăng ký bản quyền.",
        },
        pricing: {
            title: "Giá cả đơn giản, minh bạch",
            description: "Chọn gói phù hợp với bạn\nTất cả các gói đều bao gồm quyền truy cập vào nền tảng của chúng tôi, công cụ tạo khách hàng tiềm năng và hỗ trợ chuyên dụng.",
            monthly: "thanh toán hàng tháng",
            annually: "thanh toán hàng năm",
            save: "Tiết kiệm 20%",
            annualBilling: "Thanh toán hàng năm",
            popular: "Phổ biến",
            perMonth: "tháng",
            plans: {
                basic: {
                    name: "Cơ bản",
                    description: "Các tính năng thiết yếu cho cá nhân",
                    button: "Bắt đầu ngay",
                    features: [
                        "Phân loại AI cơ bản",
                        "Kiểm tra triệu chứng",
                        "Hỗ trợ qua email"
                    ]
                },
                pro: {
                    name: "Chuyên nghiệp",
                    description: "Các tính năng nâng cao cho gia đình",
                    button: "Bắt đầu ngay",
                    features: [
                        "Phân tích AI nâng cao",
                        "Hỗ trợ ưu tiên",
                        "Hồ sơ gia đình",
                        "Theo dõi lịch sử"
                    ]
                },
                enterprise: {
                    name: "Doanh nghiệp",
                    description: "Giải pháp hoàn chỉnh cho tổ chức",
                    button: "Liên hệ bán hàng",
                    features: [
                        "Tích hợp tùy chỉnh",
                        "Quản lý tài khoản chuyên dụng",
                        "Hỗ trợ SLA",
                        "Bảng điều khiển phân tích"
                    ]
                }
            }
        },
        intake: {
            steps: {
                triage: "Phân loại",
                complaint: "Triệu chứng",
                details: "Chi tiết"
            },
            triage: {
                title: "Hãy kiểm tra mức độ khẩn cấp trước",
                subtitle: "Chọn tùy chọn mô tả đúng nhất tình huống của bạn.",
                emergency: {
                    title: "Khẩn cấp",
                    description: "Đau dữ dội, chảy máu, khó thở hoặc mất ý thức."
                },
                urgent: {
                    title: "Khẩn trương",
                    description: "Cần giúp đỡ hôm nay. Sốt cao, dấu hiệu nhiễm trùng hoặc bệnh đột ngột."
                },
                routine: {
                    title: "Sức khỏe chung",
                    description: "Kiểm tra định kỳ, triệu chứng nhẹ hoặc câu hỏi chung."
                }
            },
            complaint: {
                title: "Hôm nay bạn thấy thế nào?",
                subtitle: "Mô tả ngắn gọn triệu chứng chính của bạn.",
                placeholder: "ví dụ: Đau đầu dữ dội sau mắt",
                uploadImage: "Tải lên hình ảnh (Tùy chọn)",
                addPhoto: "Thêm ảnh triệu chứng",
                next: "Tiếp theo",
                back: "Quay lại"
            },
            details: {
                title: "Bạn đau ở đâu?",
                subtitle: "Nhấn vào bản đồ cơ thể để chọn các vùng.",
                duration: {
                    label: "Bạn bị bao lâu rồi?",
                    options: {
                        today: "Hôm nay",
                        days: "2-3 Ngày",
                        week: "Một tuần",
                        longer: "Lâu hơn"
                    }
                },
                painLevel: "Mức độ đau (1-10)",
                startAssessment: "Bắt đầu đánh giá",
                creatingSession: "Đang tạo phiên..."
            }
        },
        chat: {
            header: {
                title: "Tư vấn qua Chat",
                session: "Phiên",
                new: "Mới",
                newAssessment: "Đánh giá mới",
                export: "Xuất cuộc trò chuyện",
                exportComingSoon: "Tính năng xuất sắp ra mắt"
            },
            input: {
                placeholder: "Nhập tin nhắn của bạn...",
                send: "Gửi"
            },
            thinking: {
                analyzing: "Đang phân tích triệu chứng...",
                checking: "Đang kiểm tra hướng dẫn y tế...",
                formulating: "Đang soạn câu trả lời...",
                default: "AI đang phân tích..."
            },
            welcome: "Xin chào! Tôi đã xem qua thông tin của bạn. Hãy để tôi hỏi một vài câu hỏi tiếp theo để hiểu rõ hơn về tình trạng của bạn. Bạn có thể cho tôi biết thêm về cảm giác của bạn không?",
            assessment: {
                pending: "Cập nhật đánh giá đang chờ xử lý",
                areas: "khu vực",
                pain: "Đau",
                duration: "Thời gian",
                noDuration: "Không rõ thời gian",
                send: "Gửi cập nhật"
            },
            triage: {
                title: "Kết quả phân loại của bạn",
                quickActions: "Hành động nhanh",
                findClinics: "Tìm phòng khám",
                bookAppointment: "Đặt lịch hẹn",
                emailDoctor: "Gửi email cho bác sĩ",
                downloadPdf: "Tải xuống PDF",
                generating: "Đang tạo...",
                callEmergency: "Gọi cấp cứu (115)",
                whileYouWait: "Trong khi chờ đợi",
                share: "Chia sẻ",
                exportResult: "Xuất kết quả",
                exporting: "Đang xuất...",
                startNew: "Bắt đầu đánh giá mới",
                clinicToast: "Đang mở danh sách phòng khám gần đây...",
                clinicDesc: "Tính năng này sẽ hiển thị các phòng khám dựa trên vị trí của bạn",
                appointmentToast: "Đang mở đặt lịch hẹn...",
                appointmentDesc: "Kết nối với các nhà cung cấp dịch vụ y tế trong khu vực của bạn",
                emailToast: "Email đã sẵn sàng!",
                emailDesc: "Đang mở ứng dụng email của bạn với báo cáo",
                downloadToast: "Đã tải xuống báo cáo!",
                downloadDesc: "Kiểm tra thư mục tải xuống của bạn",
                shareTitle: "Báo cáo sức khỏe Medagen",
                shareToast: "Đã sao chép liên kết vào bộ nhớ tạm!"
            },
            quickReplies: {
                label: "Gợi ý nhanh",
                pain: {
                    throbbing: "Có, nó đau nhói",
                    dull: "Không, nó đau âm ỉ",
                    comesAndGoes: "Đau từng cơn",
                    constant: "Đau liên tục"
                },
                duration: {
                    today: "Mới bắt đầu hôm nay",
                    fewDays: "2-3 ngày trước",
                    week: "Khoảng một tuần",
                    moreThanWeek: "Hơn một tuần"
                },
                progression: {
                    worse: "Đang tệ hơn",
                    same: "Vẫn như cũ",
                    better: "Đang đỡ hơn",
                    unsure: "Không chắc"
                },
                medication: {
                    paracetamol: "Có, paracetamol",
                    ibuprofen: "Có, ibuprofen",
                    none: "Chưa uống thuốc",
                    regular: "Tôi uống thuốc đều đặn"
                },
                headache: {
                    behindEyes: "Sau hốc mắt",
                    wholeHead: "Cả đầu",
                    oneSide: "Chỉ một bên",
                    backOfHead: "Sau gáy"
                },
                fever: {
                    high: "Có, sốt cao",
                    mild: "Sốt nhẹ",
                    none: "Không sốt",
                    unsure: "Không chắc"
                },
                initial: {
                    tellMore: "Kể thêm cho tôi",
                    whatToDo: "Tôi nên làm gì?",
                    worried: "Tôi lo lắng",
                    serious: "Có nghiêm trọng không?"
                },
                default: {
                    yes: "Có",
                    no: "Không",
                    notSure: "Tôi không chắc",
                    explain: "Bạn có thể giải thích thêm không?"
                }
            }
        }
    }
};
