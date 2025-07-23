"use server";

import * as z from "zod";

const formSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
});

export async function submitContactForm(values: z.infer<typeof formSchema>) {
  // Validate the form values on the server.
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data." };
  }
  
  try {
    // Here you would typically send an email, save to a database, etc.
    // For this example, we'll just log the data to the console.
    console.log("New contact form submission:", validatedFields.data);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, message: "Message sent successfully!" };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return { success: false, message: "Failed to send message due to a server error." };
  }
}
