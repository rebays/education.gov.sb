"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * A `Select` bound to a plain `[value, label]` list — used for the "Topic"
 * field on the contact forms. Split into its own client component because
 * `SelectValue`'s label-resolver is a function, and functions can't be
 * passed as children from a server component (the pages that use this
 * still need to stay server components so they can export `metadata`).
 */
export function TopicSelect({
  id,
  name = "topic",
  defaultValue,
  topics,
}: {
  id: string;
  name?: string;
  defaultValue: string;
  topics: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger id={id}>
        <SelectValue>
          {(value: string | null) =>
            topics.find(([v]) => v === value)?.[1] ?? "Select a topic"
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {topics.map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
