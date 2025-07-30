-- Tableros (Dashboards)
create table if not exists dashboards (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default now(),
  google_calendar_url text,
  weather_location text
);

-- Invitaciones a tableros (para compartir por link)
create table if not exists dashboard_invites (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid references dashboards(id) on delete cascade,
  invite_code text unique not null,
  created_at timestamp with time zone default now()
);

-- Relación de usuarios y tableros (colaboradores)
create table if not exists dashboard_users (
  dashboard_id uuid references dashboards(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member',
  joined_at timestamp with time zone default now(),
  primary key (dashboard_id, user_id)
);

-- Columnas del tablero
create table if not exists columns (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid references dashboards(id) on delete cascade,
  title text not null,
  position int not null default 0
);

-- Etiquetas configurables por tablero
create table if not exists labels (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid references dashboards(id) on delete cascade,
  name text not null,
  color text not null,
  pinned boolean default false,
  usage_count int default 0,
  unique (dashboard_id, name)
);

-- Tareas
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid references dashboards(id) on delete cascade,
  column_id uuid references columns(id) on delete set null,
  title text not null,
  description text,
  created_at timestamp with time zone default now(),
  date date,
  image_url text,
  user_id uuid references auth.users(id) on delete set null
);

-- Relación tareas-etiquetas (muchos a muchos)
create table if not exists task_labels (
  task_id uuid references tasks(id) on delete cascade,
  label_id uuid references labels(id) on delete cascade,
  primary key (task_id, label_id)
);

-- Checklist de tareas (soporta grupos anidados)
create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade,
  parent_id uuid references checklist_items(id) on delete cascade,
  text text not null,
  completed boolean default false,
  type text check (type in ('item', 'group')) not null,
  position int not null default 0
);

-- Mensajes de chat por tablero
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid references dashboards(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  sender_type text check (sender_type in ('user', 'ai')) not null,
  content text not null,
  timestamp timestamp with time zone default now()
);

-- Logs de cambios (auditoría)
create table if not exists change_logs (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid references dashboards(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamp with time zone default now()
);

-- Índices útiles
create index if not exists idx_tasks_dashboard_column on tasks (dashboard_id, column_id);
create index if not exists idx_columns_dashboard on columns (dashboard_id);
create index if not exists idx_labels_dashboard on labels (dashboard_id);
create index if not exists idx_checklist_items_task_parent on checklist_items (task_id, parent_id);
create index if not exists idx_chat_messages_dashboard on chat_messages (dashboard_id);
create index if not exists idx_change_logs_dashboard on change_logs (dashboard_id);
