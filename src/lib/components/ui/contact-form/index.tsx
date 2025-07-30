import React, { useState } from "react";
import { MessageCircle, Mail, Phone } from "lucide-react";
import { clsx } from "clsx";
import { MultiInput } from "../multi-input";
import { ScriptInput } from "../script-input";

export interface ContactData {
  emails: string[];
  phoneNumbers: string[];
  emailSubject: string;
  whatsappCaption: string;
}

export interface ContactFormProps {
  title?: string;
  description?: string;
  contactData: ContactData;
  onContactDataChange: (data: ContactData) => void;
  isOptional?: boolean;
  className?: string;
  showCaption?: boolean;
  type?: "whatsapp" | "email" | "general";
}

const emailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneValidator =
  /^\+?\d{1,3}?[-. ]?\(?\d{1,4}?\)?[-. ]?\d{1,4}[-. ]?\d{1,9}$/;

export const ContactForm = React.forwardRef<HTMLDivElement, ContactFormProps>(
  (
    {
      title,
      description,
      contactData,
      onContactDataChange,
      isOptional = false,
      className = "",
      showCaption = true,
      type = "general",
    },
    ref
  ) => {
    const getIcon = () => {
      switch (type) {
        case "whatsapp":
          return <MessageCircle className="w-8 h-8 text-green-600" />;
        case "email":
          return <Mail className="w-8 h-8 text-blue-600" />;
        default:
          return <Phone className="w-8 h-8 text-gray-600" />;
      }
    };

    const getDefaultTitle = () => {
      switch (type) {
        case "whatsapp":
          return "WhatsApp Details";
        case "email":
          return "Email Details";
        default:
          return "Contact Details";
      }
    };

    const getDefaultDescription = () => {
      switch (type) {
        case "whatsapp":
          return "Add WhatsApp numbers and caption to send the video";
        case "email":
          return "Add email addresses and message to send the video";
        default:
          return "Add contact information to share the video";
      }
    };

    return (
      <div
        ref={ref}
        className={clsx(
          "w-full shadow-lg p-6 border border-gray-300 rounded-xl bg-gray-50",
          className
        )}
      >
        {/* Header */}
        <div className="mb-6 flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {title || getDefaultTitle()}{" "}
              {isOptional && (
                <span className="text-sm font-normal text-gray-500">
                  (optional)
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {description || getDefaultDescription()}
            </p>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Addresses */}
          {(type === "email" || type === "general") && (
            <div className="space-y-1">
              <MultiInput
                label="Email Addresses"
                placeholder="Enter email address"
                value={contactData.emails}
                onChange={(emails) =>
                  onContactDataChange({ ...contactData, emails })
                }
                validator={emailValidator.test.bind(emailValidator)}
                helperText="Press Enter or comma to add multiple emails"
                leftIcon={<Mail className="w-5 h-5" />}
                maxItems={10}
              />
            </div>
          )}

          {/* Phone Numbers */}
          {(type === "whatsapp" || type === "general") && (
            <div className="space-y-1">
              <MultiInput
                label={
                  type === "whatsapp" ? "WhatsApp Numbers" : "Phone Numbers"
                }
                placeholder="Enter phone number"
                value={contactData.phoneNumbers}
                onChange={(phoneNumbers) =>
                  onContactDataChange({ ...contactData, phoneNumbers })
                }
                validator={phoneValidator.test.bind(phoneValidator)}
                helperText="Include country code (e.g., +1234567890)"
                leftIcon={
                  type === "whatsapp" ? (
                    <MessageCircle className="w-5 h-5" />
                  ) : (
                    <Phone className="w-5 h-5" />
                  )
                }
                maxItems={10}
              />
            </div>
          )}

          {/* Caption/Message */}
          {showCaption && (
            <div
              className={clsx(
                "space-y-1",
                type === "general" ? "lg:col-span-2" : ""
              )}
            >
              <ScriptInput
                label={type === "email" ? "Email Subject" : "WhatsApp Caption"}
                placeholder={
                  type === "email"
                    ? "Enter email subject..."
                    : "Enter caption for the video..."
                }
                value={
                  type === "email"
                    ? contactData.emailSubject
                    : contactData.whatsappCaption
                }
                onChange={(e) =>
                  onContactDataChange({
                    ...contactData,
                    [type === "email" ? "emailSubject" : "whatsappCaption"]:
                      e.target.value,
                  })
                }
                rows={type === "email" ? 2 : 4}
              />
            </div>
          )}
        </div>

        {/* Helper Text */}
        <div className="mt-4 text-xs text-gray-500">
          {type === "whatsapp" && (
            <p>
              • Make sure the WhatsApp numbers are active and can receive
              messages
            </p>
          )}
          {type === "email" && (
            <p>
              • Videos will be sent as attachments or download links via email
            </p>
          )}
        </div>
      </div>
    );
  }
);

ContactForm.displayName = "ContactForm";
