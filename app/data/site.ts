export const EMAIL = "phil@basswoodcreative.com";
export const MAILTO = `mailto:${EMAIL}`;
export const X_HANDLE = "@bainpm";
export const X_URL = "https://x.com/bainpm";

type Stat = {
  value: string;
  label: string;
  note?: string;
};

// Live figures drift — re-verify each stat against its source before deploying.
// Collection of record: bwc vault, "18 Metrics Collection Guide".
// Official analytics: info.skyeco.com (API served via info-sky.blockanalitica.com,
// headers: Accept: application/json + atlas-restricted: false).
export const STATS: Stat[] = [
  {
    value: "$19.8B",
    label: "Sky Ecosystem TVL, per the protocol's official analytics",
    // info-sky.blockanalitica.com/api/v1/overall/ — sky_ecosystem_tvl
    // $19.76B on 2026-07-06 (~$14.2B collateral + ~$5.5B savings)
  },
  {
    value: "$5.5B",
    label: "held in the Savings module, fronted by a widget built end to end",
    // same endpoint — sky_savings_rate_tvl, $5.54B on 2026-07-06
  },
  {
    value: "#3",
    label: "USDS's rank among stablecoins by supply ($8B circulating)",
    // stablecoins.llama.fi — USDS $7.97B on 2026-07-06 (DAI #4, $4.84B)
  },
  {
    value: "~$400M",
    label: "voting power participating through the governance portal",
    // vote.sky.money tally APIs — 6.5–7.0B SKY per poll at current price
  },
  {
    value: "761K",
    label: "wallets across the Sky ecosystem",
    // same official endpoint — sky_ecosystem_wallet_count, 761,295 on 2026-07-06
  },
];
