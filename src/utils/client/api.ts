import { postUserUrl } from "@src/urls.client.ts";
import { setIsError } from "@store/store";
import { captureClientException } from "./observability";
import { redirectToIdPorten } from "./redirect";

interface eventObjectProps {
  ident: string;
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
  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });
  } catch (error) {
    captureClientException(error, "fetch-api-data");
    throw error;
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new NotFoundError("Document not found");
    }

    const error = new Error("Get request failed");
    captureClientException(error, "fetch-api-data", response.status);
    throw error;
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
      return;
    }

    captureClientException(
      new Error("Post request failed"),
      "select-represented-user",
      response.status,
    );
    setIsError(true);
  }
};
