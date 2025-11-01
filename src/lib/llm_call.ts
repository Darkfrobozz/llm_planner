import { SETTINGS } from "./Settings/API";
import type { ChatCompletionResponse, ChatRequestBody, Message } from "./llm_types.ts";
import taskFormatExample from "./data/format.json";
import taskTest from "./data/test.json";
import { warn, debug, trace, info, error } from "@tauri-apps/plugin-log";

type Result = {
    Result: Task[]
}

type Task = {
    task: string;
    id: number;
    Dependencies: number[];
}

function system_prompt(): string {
    let systemPrompt = `Return response in this exact JSON format: ${JSON.stringify(taskFormatExample)}`;
    return systemPrompt;
}

export async function workBreakdown(prompt: string, test: boolean = false): Promise<Task[]> {
    if (test) {
        return taskTest.Result;
    }

    const response = await make_llm_request(
        SETTINGS.MODEL,
        [
            { role: "system", content: system_prompt() },
            { role: "user", content: prompt }
        ],
    );

    let content: Result;

    let stringcontent = response.choices[0].message.content;

    const json_start = stringcontent.indexOf("{");
    const json_end = stringcontent.lastIndexOf("}");
    let valid_json = stringcontent.substring(json_start, json_end + 1).replaceAll('\n', '');

    info("valid json was");
    info(valid_json);
    const cleaned = valid_json;
    try {
        content = JSON.parse(cleaned);
    } catch (parseError) {
        warn(`Failed to parse LLM response. Error: ${parseError}`);
        warn(`Raw response content: ${response.choices[0].message.content}`);
        throw new Error(`Invalid JSON format in LLM response: ${parseError}`);
    }
    return content.Result;
}

async function make_llm_request(model: string, messages: Message[]): Promise<ChatCompletionResponse> {
    const body: ChatRequestBody = {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 512
    };

    const res = await fetch(SETTINGS.ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${SETTINGS.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errText = await res.text();

        Error(`OpenRouter API error: ${res.status} ${res.statusText} - ${errText} ${res} ${JSON.stringify(res)}`);
        throw new Error(
            `OpenRouter API error: ${res.status} ${res.statusText} - ${errText} ${res} ${JSON.stringify(res)}`,
        );
    }

    const json = (await res.json()) as ChatCompletionResponse;
    return json;
}