export const EMAIL = "phil@basswoodcreative.com";
export const MAILTO = `mailto:${EMAIL}`;

type Stat = {
  value: string;
  label: string;
  note?: string;
};

// Live figures drift — re-verify each stat against its source before deploying.
// Collection of record: bwc vault, "18 Metrics Collection Guide" (2026-07-05).
export const STATS: Stat[] = [
  {
    value: "$6B",
    label: "TVL of the protocol behind the flagship UI",
    note: "peak ~$20B, 2021",
    // api.llama.fi/protocol/sky — current TVL; peak $19.83B on 2021-12-01
  },
  {
    value: "$5.6B",
    label: "held in the Savings module, fronted by a widget built end to end",
    // info-sky.blockanalitica.com/api/v1/overall/ — SSR TVL
  },
  {
    value: "#3 + #4",
    label: "stablecoins by supply (USDS + DAI, $12.8B combined)",
    // stablecoins.llama.fi — USDS $8.0B rank 3, DAI $4.84B rank 4
  },
  {
    value: "~$400M",
    label: "voting power participating through the governance portal",
    // vote.sky.money tally APIs — 6.5–7.0B SKY per poll at current price
  },
  {
    value: "8 years",
    label: "inside one blue-chip protocol, developer → co-founder & team lead",
  },
];
