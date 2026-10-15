import { notFound } from "next/navigation";

/* Any path that matches no page renders the language's not-found page inside the site layout. */
export default function CatchAll() { notFound(); }
