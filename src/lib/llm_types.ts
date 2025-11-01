export type Message = {
    role: "system" | "user" | "assistant";
    content: string;
}
export type ChatRequestBody = {
    model: string;
    messages: Message[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    response_format?: { type: "json_object", schema: { type: 'object', properties: object, required: string[] } }; // Add this line to include
}
export type ChatCompletionResponse = {
    id: string;
    object: "chat.completion";
    created: number;
    model: string;
    choices: Choice[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export type Choice = {
    index: number;
    message: Message;
    finish_reason?: string;
}