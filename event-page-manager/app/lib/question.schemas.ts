import { z } from "zod";

export const CreateQuestionSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "content is required") 
    .max(500, "content must be at most 500 characters"),

  name: z
    .string()
    .trim()
    .max(100, "name must be at most 100 characters")
    .optional(),
});

export type CreateQuestionDTO = z.infer<typeof CreateQuestionSchema>;