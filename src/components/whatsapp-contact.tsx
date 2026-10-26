import { getWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppContact() {
  const href = getWhatsAppUrl();

  return (
    <div className="whatsapp-contact">
      <span className="whatsapp-contact__icon" aria-hidden="true">
        W
      </span>
      <div className="whatsapp-contact__copy">
        <strong>Prefer a quick chat?</strong>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer">
            Message SpaceEnvy on WhatsApp <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <span>Our WhatsApp contact will be available here soon.</span>
        )}
      </div>
    </div>
  );
}
