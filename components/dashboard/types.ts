// Server から Client Component に渡す workout / body の serializable 型。
// Date オブジェクトはシリアライズで揺れるので ISO 文字列で運ぶ。

export type WorkoutPayload = {
  id: string;
  date: string;
  distanceKm: number;
  durationSec: number;
  calories: number;
};

export type BodyPayload = {
  id: string;
  date: string;
  weightKg: number;
  bodyFatPct: number;
};
