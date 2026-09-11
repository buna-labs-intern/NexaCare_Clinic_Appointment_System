import { z } from 'zod'

export const serviceSchema = z.object({
  name: z.string().trim().min(2, 'Service name is required'),
  category: z.string().trim().min(2, 'Category is required'),
  description: z.string().trim().optional(),
  price: z.number().positive('Price must be greater than 0'),
  duration: z.number().int().min(5, 'Duration must be at least 5 minutes'),
  isActive: z.boolean(),
})

export type ServiceFormValues = z.infer<typeof serviceSchema>
