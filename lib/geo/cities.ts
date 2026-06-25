export type City = {
  id: string;
  label: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  aliases: string[];
};

export const cities: City[] = [
  {
    id: "shijiazhuang-cn",
    label: "Shijiazhuang, Hebei, China",
    country: "China",
    latitude: 38.0428,
    longitude: 114.5149,
    timezone: "Asia/Shanghai",
    aliases: ["石家庄", "石家庄市", "Shijiazhuang"],
  },
  {
    id: "beijing-cn",
    label: "Beijing, China",
    country: "China",
    latitude: 39.9042,
    longitude: 116.4074,
    timezone: "Asia/Shanghai",
    aliases: ["北京", "北京市", "Beijing"],
  },
  {
    id: "shanghai-cn",
    label: "Shanghai, China",
    country: "China",
    latitude: 31.2304,
    longitude: 121.4737,
    timezone: "Asia/Shanghai",
    aliases: ["上海", "上海市", "Shanghai"],
  },
  {
    id: "guangzhou-cn",
    label: "Guangzhou, Guangdong, China",
    country: "China",
    latitude: 23.1291,
    longitude: 113.2644,
    timezone: "Asia/Shanghai",
    aliases: ["广州", "广州市", "Guangzhou"],
  },
  {
    id: "chengdu-cn",
    label: "Chengdu, Sichuan, China",
    country: "China",
    latitude: 30.5728,
    longitude: 104.0668,
    timezone: "Asia/Shanghai",
    aliases: ["成都", "成都市", "Chengdu"],
  },
  {
    id: "hong-kong",
    label: "Hong Kong",
    country: "China",
    latitude: 22.3193,
    longitude: 114.1694,
    timezone: "Asia/Hong_Kong",
    aliases: ["香港", "Hong Kong", "HK"],
  },
  {
    id: "taipei-tw",
    label: "Taipei, Taiwan",
    country: "Taiwan",
    latitude: 25.033,
    longitude: 121.5654,
    timezone: "Asia/Taipei",
    aliases: ["台北", "Taipei"],
  },
  {
    id: "new-york-us",
    label: "New York, United States",
    country: "United States",
    latitude: 40.7128,
    longitude: -74.006,
    timezone: "America/New_York",
    aliases: ["纽约", "New York", "NYC"],
  },
  {
    id: "los-angeles-us",
    label: "Los Angeles, United States",
    country: "United States",
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: "America/Los_Angeles",
    aliases: ["洛杉矶", "Los Angeles", "LA"],
  },
  {
    id: "london-uk",
    label: "London, United Kingdom",
    country: "United Kingdom",
    latitude: 51.5072,
    longitude: -0.1276,
    timezone: "Europe/London",
    aliases: ["伦敦", "London"],
  },
  {
    id: "paris-fr",
    label: "Paris, France",
    country: "France",
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: "Europe/Paris",
    aliases: ["巴黎", "Paris"],
  },
  {
    id: "singapore-sg",
    label: "Singapore",
    country: "Singapore",
    latitude: 1.3521,
    longitude: 103.8198,
    timezone: "Asia/Singapore",
    aliases: ["新加坡", "Singapore"],
  },
];

export function resolveCity(value: string) {
  const normalized = value.trim().toLowerCase();

  return (
    cities.find((city) => city.id === normalized) ??
    cities.find((city) => city.label.toLowerCase() === normalized) ??
    cities.find((city) =>
      city.aliases.some((alias) => alias.toLowerCase() === normalized),
    ) ??
    cities.find((city) =>
      [city.label, ...city.aliases].some((entry) =>
        entry.toLowerCase().includes(normalized),
      ),
    )
  );
}
