import { postUserUrl } from "@src/urls.client.ts";
import { setIsError } from "@store/store";
import { redirectToIdPorten } from "./redirect";

interface eventObjectProps {
  ident: string;
  type?: string;
}

export class NotFoundError extends Error {
  constructor(message = "") {
    super(message);
    this.message = message;
  }
}

export const include = {
  credentials: "include",
};

export const fetcher = async (url: string) => {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new NotFoundError("Document not found");
    }
    throw new Error("Get request failed");
  }

  return await response.json();
};

export const postUser = async (ident: eventObjectProps) => {
  const response = await fetch(postUserUrl, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ident),
  });

  if (!response.ok) {
    if (response.status === 401) {
      redirectToIdPorten();
    }
    setIsError(true);
    //throw new Error("Post request failed");
  }
};
