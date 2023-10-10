import { isEmpty } from 'lodash';
import { defaultMessage, defaultStatusCode } from './constant';
import { responseFilter } from './response-filter';
let instance;

export class ResponseHelper {
	constructor(value) {
		if (!instance) {
			instance = this
		}
		return instance
	}

	sendResponse(res, response) {
		if (response instanceof Error) {
			const statusCode = response.cause.code
			if (statusCode === defaultStatusCode.NOT_AUTHORIZED) {
				return this.notAuthorized(res, response, response.message)
			} else if (statusCode === defaultStatusCode.NO_CONTENT) {
				return this.noContent(res, response, response.message)
			} else if (statusCode === defaultStatusCode.ACCESS_FORBIDDEN) {
				return this.accessForbidden(res, response, response.message)
			} else if (statusCode === defaultStatusCode.VALIDATION_ERROR) {
				return this.validationError(res, response, response.cause.value || [], response.message)
			} else if (statusCode === defaultStatusCode.NOT_FOUND) {
				return this.notFound(res, response, response.message)
			} else if (statusCode === defaultStatusCode.CONFLICT) {
				return this.conflict(res, response, response.message)
			} else if (statusCode === defaultStatusCode.UN_PROCESSIBLE_ENTITY) {
				return this.unprocessibleEntity(res, response, response.message)
			} else if (statusCode === defaultStatusCode.RESOURCE_CREATED) {
				return this.resourceCreated(res, response, response.message)
			} else {
				return this.onError(res, response, response.message)
			}
		} else {
			return this.onSuccess(res, response.message, response.data, response.status)
		}
	}

	onSuccess(res, message, data, statusCode) {
		const { responseAttribute } = res.locals
		if (data && !isEmpty(responseAttribute)) {
			data = responseFilter(data, responseAttribute)
		}
		return res.json({
			status: statusCode || defaultStatusCode.SUCCESS,
			message,
			data,
			refreshToken: res.refreshToken
		})
	}

	notAuthorized(res, error, message = defaultMessage.NOT_AUTHORIZED) {
		return res.status(defaultStatusCode.NOT_AUTHORIZED).send({
			message: error.message || message,
			refreshToken: res.refreshToken
		})
	}

	accessForbidden(res, error, message = defaultMessage.ACCESS_FORBIDDEN) {
		return res.status(defaultStatusCode.ACCESS_FORBIDDEN).send({
			message: error.message || message,
			refreshToken: res.refreshToken
		})
	}

	validationError(res, error, data, message = defaultMessage.VALIDATION_ERROR) {
		return res.status(defaultStatusCode.UN_PROCESSIBLE_ENTITY).send({
			message: error.message || message,
			data,
			refreshToken: res.refreshToken
		})
	}

	onError(res, error, message = defaultMessage.ERROR) {
		return res.status(error.statusCode || defaultStatusCode.ERROR).send({
			message: error.message || message,
			refreshToken: res.refreshToken
		})
	}

	notFound(res, error, message = defaultMessage.NOT_FOUND) {
		return res.status(error.statusCode || defaultStatusCode.NOT_FOUND).send({
			message: error.message || message,
			refreshToken: res.refreshToken
		})
	}

	noContent(res, error, message = defaultMessage.NO_CONTENT) {
		return res.status(error.statusCode || defaultStatusCode.NO_CONTENT).send({
			message: error.message || message,
			refreshToken: res.refreshToken
		})
	}

	conflict(res, error, message = defaultMessage.CONFLICT) {
		return res.status(error.statusCode || defaultStatusCode.CONFLICT).send({
			message: error.message || message,
			refreshToken: res.refreshToken
		})
	}

	unprocessibleEntity(res, error, message = defaultMessage.UN_PROCESSIBLE_ENTITY) {
		return res.status(error.statusCode || defaultStatusCode.UN_PROCESSIBLE_ENTITY).send({
			message: error.message || message,
			refreshToken: res.refreshToken
		})
	}

	resourceCreated(res, error, message = defaultMessage.RESOURCE_CREATED) {
		return res.status(error.statusCode || defaultStatusCode.RESOURCE_CREATED).send({
			message: error.message || message,
			refreshToken: res.refreshToken
		})
	}
}
