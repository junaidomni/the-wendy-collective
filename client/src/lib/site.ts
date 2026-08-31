export const PUBLIC_SITE_ORIGIN = "https://thewendycollective.com";
export const GRIMSLEY_SHARE_CARD_VERSION = "2";

export function buildGrimsleyFamilyLink(token: string) {
  return `${PUBLIC_SITE_ORIGIN}/group/${encodeURIComponent(token)}?card=${GRIMSLEY_SHARE_CARD_VERSION}`;
}
