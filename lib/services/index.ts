/**
 * Services Module
 *
 * Centralized exports for all service layer functions
 */

// Export services
export { sessionService } from './session.service';
export { patientService } from './patient.service';
export { conversationService } from './conversation.service';
export { agentService } from './agent.service';

// Export error classes
export {
    ServiceError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ServerError,
    NetworkError,
    transformApiError,
    isServiceError,
    isNotFoundError,
    isValidationError,
    isUnauthorizedError,
    isServerError,
    isNetworkError,
} from './errors';

// Re-export default services for convenience
export { default as sessionServiceDefault } from './session.service';
export { default as patientServiceDefault } from './patient.service';
export { default as conversationServiceDefault } from './conversation.service';
export { default as agentServiceDefault } from './agent.service';
