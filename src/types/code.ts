export interface CodeGroup {
  group_id: string;
  group_name: string;
  description: string;
}

export interface CodeDetail {
  code_id: string;
  group_id: string;
  code_name: string;
  code_value: string;
  sort_order: number;
  is_active: boolean;
} 