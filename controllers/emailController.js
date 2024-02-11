const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const helpers = require('../utilities/helpers');

module.exports = class Email {
    constructor(user, url, token) {
        this.url = url;
        this.token = token;
        this.from = `Company Name <${process.env.EMAIL_FROM}>`;
        this.user = user;
        this.to = user.email;
        this.firstName = helpers.toTitleCase(user.firstName);
    }

    newTransport() {
        if (process.env.NODE_ENV === 'development') {
            return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async send(template, subject) {
        const html = pug.renderFile(
            `${__dirname}/../views/emails/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                token: this.token,
                subject,
            }
        );

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html),
        };

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Company Name family');
    }

    async sendReset() {
        await this.send(
            'resetPassword',
            'Your password reset token (valid for 10 mins)'
        );
    }
};
