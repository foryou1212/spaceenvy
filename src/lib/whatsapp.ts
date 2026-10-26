export function getWhatsAppUrl() {
  const configuredNumber = process.env.NEXT_PUBLIC_SPACEENVY_WHATSAPP_NUMBER?.trim();
  if (!configuredNumber || !/^\+?[\d\s().-]+$/.test(configuredNumber)) return null;

  const internationalNumber = configuredNumber.replace(/\D/g, "");
  if (!/^[1-9]\d{7,14}$/.test(internationalNumber)) return null;

  const message =
    "Hi SpaceEnvy, I’m interested in discussing an interior design project in Hyderabad.";

  return `https://wa.me/${internationalNumber}?text=${encodeURIComponent(message)}`;
}
