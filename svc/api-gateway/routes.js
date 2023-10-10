const ROUTES = [
    {
        url: '/users',
        auth: false,
        creditCheck: false,
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            max: 5
        },
        proxy: {
            target: `http://localhost:${process.env.USER_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/organization',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.ORG_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/auth',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.AUTH_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/role',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.ORG_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/master',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.BUSINESS_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/knowledge-base',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.BUSINESS_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/interaction',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.INTERACTION_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/customer',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.CUSTOMER_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/accounts',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.ACCOUNT_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/services',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.ACCOUNT_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/invoice',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.INVOICE_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/contract',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.CONTRACT_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/workflow',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.WORKFLOW_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/helpdesk',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.HELPDESK_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/profile',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.PROFILE_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/order',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.ORDER_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/billing',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.BILLING_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/intelligence-corner',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.IC_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/whatsapp',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.WHATSAPP_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/appointment',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.APPOINTMENT_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/common',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.COMMON_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/product',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.PRODUCT_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/ai-service',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.CUSTOMER_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/report',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.REPORT_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/bulk-upload',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.BULKUPLOAD_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/chat',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.CHATBOT_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/charge',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.CHARGE_SERVICE_PORT}`,
            changeOrigin: true
        }
    }, {
        url: '/settings',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.SETTINGS_SERVICE_PORT}`,
            changeOrigin: true
        }
    },{
        url: '/notification',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.COMMON_SERVICE_PORT}`,
            changeOrigin: true
        }
    },{
        url: '/bi',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.REPORT_SERVICE_PORT}`,
            changeOrigin: true
        }
    },{
        url: '/inventory',
        auth: false,
        creditCheck: false,
        proxy: {
            target: `http://localhost:${process.env.INVENTORY_SERVICE_PORT}`,
            changeOrigin: true
        }
    }
]

exports.ROUTES = ROUTES;
