"use client"

import { API_BASE_URL } from "@/lib/config"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import LoadingOverlay from "@/components/loading-overlay"
import {
  noteCreationSchema,
  type NoteCreationValues,
} from "@/schemas/hardware"

interface HardwareNoteFormProps {
  itemId: number
  onSuccess?: () => void
}

export function HardwareNoteForm({ itemId, onSuccess }: HardwareNoteFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NoteCreationValues>({
    resolver: zodResolver(noteCreationSchema),
    defaultValues: {
      content: "",
    },
  })

  const onSubmit = async (values: NoteCreationValues) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hardware/${itemId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to add note")
      }

      toast.success("Note added successfully!")
      reset()
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative flex flex-col gap-2 p-1">
      {isSubmitting && <LoadingOverlay transparent />}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="content">Add Note</FieldLabel>
          <Textarea
            id="content"
            placeholder="Type your note here..."
            className="min-h-15 text-sm resize-none"
            {...register("content")}
          />
          {errors.content && (
            <p className="text-sm text-destructive">{errors.content.message}</p>
          )}
        </Field>

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            Submit Note
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}