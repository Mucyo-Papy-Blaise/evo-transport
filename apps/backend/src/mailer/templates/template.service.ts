import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { wrapEmailContent } from './base.template';
import { EMAIL_TEMPLATES, getTemplate, TemplateCategory } from './index';
import { EmailMetadata, EmailTemplate } from '../types/mailer';
import { getPlatformName } from './template.utils';

// Handles email template rendering and variable replacement
@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  // Render a template by category and key with provided data
  renderTemplate(
    category: TemplateCategory,
    templateKey: string,
    data: Record<string, unknown>,
    metadata?: EmailMetadata,
  ): EmailTemplate {
    try {
      // Get the template function
      const templateFn = getTemplate(category, templateKey);

      if (!templateFn) {
        throw new NotFoundException(
          `Template not found: ${category}.${templateKey}`,
        );
      }

      // Execute template function with data
      const renderedContent = templateFn(data);

      // Wrap content with base template (header/footer)
      const html = wrapEmailContent(renderedContent as string, metadata);

      // Generate subject (can be enhanced with template-specific subjects)
      const subject = this.generateSubject(category, templateKey, data);

      return {
        subject,
        html,
      };
    } catch (error) {
      this.logger.error(
        `Error rendering template ${category}.${templateKey}:`,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          category,
          templateKey,
          data,
        },
      );
      throw error;
    }
  }

  // Render custom HTML template with variable replacement
  renderCustomTemplate(
    html: string,
    variables: Record<string, string>,
    metadata?: EmailMetadata,
  ): string {
    try {
      // Replace variables in the template
      const renderedContent = this.replaceVariables(html, variables);

      // Wrap with base template
      return wrapEmailContent(renderedContent, metadata);
    } catch (error) {
      this.logger.error('Error rendering custom template:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // Supports multiple formats: {{var}}, %var%, ${var}
  private replaceVariables(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template;

    Object.entries(variables).forEach(([key, value]) => {
      const safeValue = value || '';

      // Replace {{variable}} format
      result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), safeValue);

      // Replace %variable% format
      result = result.replace(new RegExp(`%${key}%`, 'g'), safeValue);

      // Replace ${variable} format
      result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), safeValue);
    });

    // Clean up any remaining unreplaced variables
    result = result.replace(/{{[^}]+}}/g, '');
    result = result.replace(/%[^%]+%/g, '');
    result = result.replace(/\$\{[^}]+\}/g, '');

    return result;
  }

  
  // Generate subject line based on template
  private generateSubject(
    category: TemplateCategory,
    templateKey: string,
    data: Record<string, unknown>,
  ): string {
    const platformName =
      typeof data.platformName === 'string'
        ? data.platformName
        : getPlatformName(data);

    // Subject mapping for different templates
    const subjectMap: Record<string, string> = {
      // Auth templates
      'AUTH.WELCOME_NEW_USER': `Welcome to ${platformName}!`,
      'AUTH.WELCOME_NEW_STAFF':
        typeof data.organizationName === 'string' && data.organizationName
          ? `Welcome to ${data.organizationName}`
          : `Welcome to ${platformName}!`,
      'AUTH.EXISTING_USER': `Account Already Exists`,
      'AUTH.ADDED_TO_INSTITUTION':
        typeof data.organizationName === 'string'
          ? `You have been added to ${data.organizationName}`
          : `You have been added to an institution`,
      'AUTH.REGISTRATION_PENDING': `Registration Received`,
      'AUTH.ADMIN_NEW_REGISTRATION': `New Registration Request`,
      'AUTH.ACCOUNT_APPROVED': `Account Approved`,
      'AUTH.ACCOUNT_REJECTED': `Registration Update`,
      'AUTH.PASSWORD_RESET': `Password Reset Request`,
      'AUTH.PASSWORD_CHANGED': `Password Changed Successfully`,
      'AUTH.OTP_LOGIN': `Your Login Verification Code`,
      'AUTH.EMAIL_VERIFICATION': `Verify Your Email`,
      'AUTH.ACCOUNT_DEACTIVATED': `Account Deactivated`,
    };
    const key = `${category}.${templateKey}`;
    return subjectMap[key] || `Notification from ${platformName}`;
  }

  // Validate template data has required fields
  validateTemplateData(
    requiredFields: string[],
    data: Record<string, unknown>,
  ): { valid: boolean; missingFields: string[] } {
    const missingFields = requiredFields.filter(
      (field) => !data[field] || data[field] === '',
    );

    return {
      valid: missingFields.length === 0,
      missingFields,
    };
  }

  // Get available templates for a category
  getAvailableTemplates(category: TemplateCategory): string[] {
    const templates = EMAIL_TEMPLATES[category];
    return templates ? Object.keys(templates) : [];
  }

  // Check if template exists
  templateExists(category: TemplateCategory, templateKey: string): boolean {
    const template = getTemplate(category, templateKey);
    return template !== null;
  }

  // Preview template with sample data (useful for testing)
  previewTemplate(
    category: TemplateCategory,
    templateKey: string,
    sampleData?: Record<string, unknown>,
  ): EmailTemplate {
    const defaultSampleData = this.getDefaultSampleData(category, templateKey);
    const data = { ...defaultSampleData, ...sampleData };

    return this.renderTemplate(category, templateKey, data);
  }

  // Get default sample data for template preview
  private getDefaultSampleData(
    category: TemplateCategory,
    templateKey: string,
  ): Record<string, string | number | Date> {
    const commonData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      platformName: getPlatformName({}),
      loginUrl: 'https://lms.example.com/login',
    };

    // Template-specific sample data
    const templateSampleData: Record<string, Record<string, unknown>> = {
      'AUTH.WELCOME_NEW_USER': {
        ...commonData,
        tempPassword: 'Temp@123456',
      },
      'AUTH.PASSWORD_RESET': {
        ...commonData,
        resetUrl: 'https://lms.example.com/reset-password?token=abc123',
        expiryHours: 1,
      },
      'AUTH.OTP_LOGIN': {
        ...commonData,
        otp: '123456',
        expiryMinutes: 5,
      },
      'AUTH.EMAIL_VERIFICATION': {
        ...commonData,
        verificationUrl: 'https://lms.example.com/verify?token=abc123',
        verificationCode: 'ABC123XYZ',
        expiryHours: 24,
      },
      'AUTH.ACCOUNT_APPROVED': {
        ...commonData,
      },
      'AUTH.ACCOUNT_REJECTED': {
        ...commonData,
        reason: 'Invalid email domain',
      },
      'AUTH.ACCOUNT_DEACTIVATED': {
        ...commonData,
        reason: 'Account inactive for 90 days',
        reactivationUrl: 'https://lms.example.com/reactivate',
      },
      'AUTH.REGISTRATION_PENDING': {
        ...commonData,
      },
      'AUTH.ADMIN_NEW_REGISTRATION': {
        ...commonData,
        adminUrl: 'https://lms.example.com/admin/registrations',
      },
      'AUTH.PASSWORD_CHANGED': {
        ...commonData,
        changedAt: new Date().toLocaleString(),
        supportUrl: 'https://lms.example.com/support',
      },
    };
    const key = `${category}.${templateKey}`;
    return (templateSampleData[key] || commonData) as Record<
      string,
      string | number | Date
    >;
  }

  // Batch render multiple templates
  renderBatch(
    templates: Array<{
      category: TemplateCategory;
      templateKey: string;
      data: Record<string, unknown>;
      metadata?: EmailMetadata;
    }>,
  ): EmailTemplate[] {
    const results: EmailTemplate[] = [];

    for (const template of templates) {
      try {
        const rendered = this.renderTemplate(
          template.category,
          template.templateKey,
          template.data,
          template.metadata,
        );
        results.push(rendered);
      } catch (error) {
        this.logger.error(`Error in batch render:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          template: `${template.category}.${template.templateKey}`,
        });
        // Continue with other templates even if one fails
        results.push({
          subject: 'Error rendering template',
          html: '<p>Error rendering template</p>',
        });
      }
    }

    return results;
  }
}
