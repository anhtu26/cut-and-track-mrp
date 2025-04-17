
import { z } from "zod";

// Define schema for user data validation
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email("Invalid email address"),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  department: z.string().nullable(),
  job_title: z.string().nullable(),
  roles: z.array(z.object({
    name: z.string()
  }))
});

export type User = z.infer<typeof UserSchema>;

// Define a separate type for partial user data that may be coming from forms or API responses
export type PartialUserData = {
  id: string; // Make id required to match User type
  email: string; // Make email required as it's a core identifier
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  job_title: string | null;
  roles: { name: string }[];
};
