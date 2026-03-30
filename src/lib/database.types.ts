export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      founder_leads: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          fleet_size: number | null;
          primary_concern: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone: string;
          fleet_size?: number | null;
          primary_concern?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string;
          fleet_size?: number | null;
          primary_concern?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      company_alert_settings: {
        Row: {
          company_id: string;
          email_enabled: boolean;
          recipient_email: string | null;
          include_overdue: boolean;
          include_upcoming: boolean;
          upcoming_window_days: number;
          last_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          company_id: string;
          email_enabled?: boolean;
          recipient_email?: string | null;
          include_overdue?: boolean;
          include_upcoming?: boolean;
          upcoming_window_days?: number;
          last_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company_id?: string;
          email_enabled?: boolean;
          recipient_email?: string | null;
          include_overdue?: boolean;
          include_upcoming?: boolean;
          upcoming_window_days?: number;
          last_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      company_members: {
        Row: {
          id: string;
          company_id: string;
          profile_id: string;
          role: "owner" | "admin" | "operator";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          profile_id: string;
          role?: "owner" | "admin" | "operator";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          profile_id?: string;
          role?: "owner" | "admin" | "operator";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          id: string;
          company_id: string;
          internal_code: string | null;
          plate: string;
          brand: string | null;
          model: string | null;
          year: number | null;
          current_odometer: number;
          status: "active" | "maintenance" | "inactive";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          internal_code?: string | null;
          plate: string;
          brand?: string | null;
          model?: string | null;
          year?: number | null;
          current_odometer?: number;
          status?: "active" | "maintenance" | "inactive";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          internal_code?: string | null;
          plate?: string;
          brand?: string | null;
          model?: string | null;
          year?: number | null;
          current_odometer?: number;
          status?: "active" | "maintenance" | "inactive";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vehicle_documents: {
        Row: {
          id: string;
          company_id: string;
          vehicle_id: string;
          title: string;
          document_type: string;
          language: "es" | "en" | "bilingual";
          file_url: string | null;
          expires_at: string | null;
          status: "active" | "archived";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          vehicle_id: string;
          title: string;
          document_type?: string;
          language?: "es" | "en" | "bilingual";
          file_url?: string | null;
          expires_at?: string | null;
          status?: "active" | "archived";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          vehicle_id?: string;
          title?: string;
          document_type?: string;
          language?: "es" | "en" | "bilingual";
          file_url?: string | null;
          expires_at?: string | null;
          status?: "active" | "archived";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expiration_items: {
        Row: {
          id: string;
          company_id: string;
          vehicle_id: string;
          type: string;
          title: string;
          due_date: string;
          alert_days_before: number;
          status: "active" | "completed" | "archived";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          vehicle_id: string;
          type: string;
          title: string;
          due_date: string;
          alert_days_before?: number;
          status?: "active" | "completed" | "archived";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          vehicle_id?: string;
          type?: string;
          title?: string;
          due_date?: string;
          alert_days_before?: number;
          status?: "active" | "completed" | "archived";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      maintenance_plans: {
        Row: {
          id: string;
          company_id: string;
          vehicle_id: string;
          title: string;
          trigger_type: "date" | "odometer";
          interval_days: number | null;
          interval_km: number | null;
          last_service_date: string | null;
          last_service_odometer: number | null;
          next_due_date: string | null;
          next_due_odometer: number | null;
          status: "active" | "paused" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          vehicle_id: string;
          title: string;
          trigger_type: "date" | "odometer";
          interval_days?: number | null;
          interval_km?: number | null;
          last_service_date?: string | null;
          last_service_odometer?: number | null;
          next_due_date?: string | null;
          next_due_odometer?: number | null;
          status?: "active" | "paused" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          vehicle_id?: string;
          title?: string;
          trigger_type?: "date" | "odometer";
          interval_days?: number | null;
          interval_km?: number | null;
          last_service_date?: string | null;
          last_service_odometer?: number | null;
          next_due_date?: string | null;
          next_due_odometer?: number | null;
          status?: "active" | "paused" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      service_records: {
        Row: {
          id: string;
          company_id: string;
          vehicle_id: string;
          maintenance_plan_id: string | null;
          service_date: string;
          odometer: number | null;
          service_type: string;
          cost: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          vehicle_id: string;
          maintenance_plan_id?: string | null;
          service_date: string;
          odometer?: number | null;
          service_type: string;
          cost?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          vehicle_id?: string;
          maintenance_plan_id?: string | null;
          service_date?: string;
          odometer?: number | null;
          service_type?: string;
          cost?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
