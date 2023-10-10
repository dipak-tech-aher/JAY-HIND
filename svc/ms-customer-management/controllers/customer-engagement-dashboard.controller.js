import CustomerEngagementdashboardService from '@services/customer-engagement-dashboard.service'
import { logger, ResponseHelper, statusCodeConstants } from '@utils'
import { getConnection } from '@services/connection-service'

export class CustomerEngagementDashboardController {
  constructor() {
    this.responseHelper = new ResponseHelper()
    this.engagementDashboardService = new CustomerEngagementdashboardService()
  }

  async getCounts(req, res) {
    try {
      const { body } = req;
      const conn = await getConnection();
      const response = await this.engagementDashboardService.getCounts(body, conn)
      return this.responseHelper.sendResponse(req, res, response);
    } catch (error) {
      logger.error(error);
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async getCountsData(req, res) {
    try {
      const { body } = req;
      const conn = await getConnection();
      const response = await this.engagementDashboardService.getCountsData(body, conn)
      return this.responseHelper.sendResponse(req, res, response);
    } catch (error) {
      logger.error(error);
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async recentCustomers(req, res) {
    try {
      const { body } = req;
      const conn = await getConnection();
      const response = await this.engagementDashboardService.getRecentCustomers(body, conn)
      return this.responseHelper.sendResponse(req, res, response);
    } catch (error) {
      logger.error(error);
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async topPerformingProducts(req, res) {
    try {
      const { body } = req;
      const conn = await getConnection();
      const response = await this.engagementDashboardService.topPerformingProducts(body, conn)
      return this.responseHelper.sendResponse(req, res, response);
    } catch (error) {
      logger.error(error);
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async topChannelByGrevience(req, res) {
    try {
      const { body } = req;
      const conn = await getConnection();
      const response = await this.engagementDashboardService.topChannelByGrevience(body, conn)
      return this.responseHelper.sendResponse(req, res, response);
    } catch (error) {
      logger.error(error);
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async topCustomerIssues(req, res) {
    try {
      const { body } = req;
      const conn = await getConnection();
      const response = await this.engagementDashboardService.topCustomerIssues(body, conn)
      return this.responseHelper.sendResponse(req, res, response);
    } catch (error) {
      logger.error(error);
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

  async InteractionsByChannel(req, res) {
    try {
      const { body } = req;
      const conn = await getConnection();
      const response = await this.engagementDashboardService.InteractionsByChannel(body, conn)
      return this.responseHelper.sendResponse(req, res, response);
    } catch (error) {
      logger.error(error);
      return this.responseHelper.sendResponse(req, res, { status: statusCodeConstants.ERROR, message: 'Internal server error' })
    }
  }

}
