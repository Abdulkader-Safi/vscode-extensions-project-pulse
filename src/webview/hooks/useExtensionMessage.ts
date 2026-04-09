import { useEffect, useCallback } from "react";
import { vscode } from "../vscodeApi";
import type { WebviewMessage, ExtensionMessage } from "../../types/messages";

export function useExtensionListener(
  messageType: ExtensionMessage["type"],
  handler: (message: ExtensionMessage) => void,
) {
  useEffect(() => {
    const listener = (event: MessageEvent<ExtensionMessage>) => {
      if (event.data.type === messageType) {
        handler(event.data);
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [messageType, handler]);
}

export function useExtensionListenerMulti(
  messageTypes: ExtensionMessage["type"][],
  handler: (message: ExtensionMessage) => void,
) {
  useEffect(() => {
    const listener = (event: MessageEvent<ExtensionMessage>) => {
      if (messageTypes.includes(event.data.type)) {
        handler(event.data);
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [messageTypes, handler]);
}

export function postMessage(message: WebviewMessage) {
  vscode.postMessage(message);
}
