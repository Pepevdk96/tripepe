export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      adaptation_log: {
        Row: {
          action_details: Json | null
          action_type: string
          applied: boolean | null
          date: string | null
          id: string
          plan_id: string
          trigger_details: Json | null
          trigger_type: string
          user_accepted: boolean | null
          user_id: string
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          applied?: boolean | null
          date?: string | null
          id?: string
          plan_id: string
          trigger_details?: Json | null
          trigger_type: string
          user_accepted?: boolean | null
          user_id: string
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          applied?: boolean | null
          date?: string | null
          id?: string
          plan_id?: string
          trigger_details?: Json | null
          trigger_type?: string
          user_accepted?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      athlete_profiles: {
        Row: {
          created_at: string | null
          easy_pace_seconds_per_km: number | null
          ftp_watts: number | null
          id: string
          interval_pace_seconds_per_km: number | null
          max_weekly_hours: number | null
          preferred_long_run_day: string | null
          swim_css_seconds_per_100m: number | null
          threshold_pace_seconds_per_km: number | null
          training_days_per_week: number | null
          updated_at: string | null
          user_id: string
          vo2max: number | null
          weight_kg: number | null
        }
        Insert: {
          user_id: string
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
        Relationships: []
      }
      completed_workouts: {
        Row: {
          actual_distance_meters: number | null
          actual_duration_seconds: number | null
          avg_heart_rate: number | null
          avg_pace_seconds_per_km: number | null
          avg_power_watts: number | null
          calories: number | null
          created_at: string | null
          date: string
          elevation_gain_meters: number | null
          feeling: string | null
          garmin_activity_id: string | null
          id: string
          match_score: number | null
          max_heart_rate: number | null
          normalized_power_watts: number | null
          notes: string | null
          planned_workout_id: string | null
          raw_garmin_data: Json | null
          rpe: number | null
          sport: string
          title: string | null
          training_stress_score: number | null
          user_id: string
        }
        Insert: {
          date: string
          sport: string
          user_id: string
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
        Relationships: []
      }
      planned_workouts: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          distance_meters: number | null
          duration_minutes: number | null
          hr_zone_target: number | null
          id: string
          intensity: string | null
          intervals_data: Json | null
          is_key_workout: boolean | null
          pace_target_max: number | null
          pace_target_min: number | null
          phase: string | null
          plan_id: string
          sort_order: number | null
          sport: string
          status: string | null
          title: string
          user_id: string
          week_number: number
        }
        Insert: {
          date: string
          plan_id: string
          sport: string
          title: string
          user_id: string
          week_number: number
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
        Relationships: []
      }
      races: {
        Row: {
          actual_time_seconds: number | null
          created_at: string | null
          date: string
          id: string
          name: string
          notes: string | null
          priority: string | null
          race_type: string
          status: string | null
          target_time_seconds: number | null
          user_id: string
        }
        Insert: {
          date: string
          name: string
          race_type: string
          user_id: string
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
        Relationships: []
      }
      training_plans: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          name: string
          plan_data: Json | null
          start_date: string
          status: string | null
          target_race_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          end_date: string
          name: string
          start_date: string
          user_id: string
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          email: string
          name: string
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
        Relationships: []
      }
      weekly_summaries: {
        Row: {
          actual_distance_meters: number | null
          actual_duration_minutes: number | null
          atl: number | null
          avg_rpe: number | null
          bike_km: number | null
          completed_sessions: number | null
          created_at: string | null
          ctl: number | null
          highlights: string | null
          id: string
          plan_id: string
          planned_distance_meters: number | null
          planned_duration_minutes: number | null
          planned_sessions: number | null
          run_km: number | null
          swim_km: number | null
          tsb: number | null
          user_id: string
          week_number: number
          week_start: string
        }
        Insert: {
          plan_id: string
          user_id: string
          week_number: number
          week_start: string
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          body_battery_evening: number | null
          body_battery_morning: number | null
          created_at: string | null
          date: string
          deep_sleep_minutes: number | null
          hrv_rmssd: number | null
          hrv_status: string | null
          id: string
          resting_hr: number | null
          sleep_duration_minutes: number | null
          sleep_score: number | null
          spo2_avg: number | null
          stress_avg: number | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          date: string
          user_id: string
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
        Relationships: []
      }
      garmin_tokens: {
        Row: {
          created_at: string | null
          garmin_email: string
          id: string
          last_sync_at: string | null
          sync_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          garmin_email: string
          user_id: string
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
