// /lib/models.js

const models = {
/*    gemma_2b_it: {
        tier: 'free',
        identifier: 'google/gemma-2b-it',
        costPerMillionTokens: 0.1
    },
    gemma_7b_it: {
        tier: 'free',
        identifier: 'google/gemma-7b-it',
        costPerMillionTokens: 0.2
    },
    llama_3_8b: {
        tier: 'free',
        identifier: 'meta-llama/Llama-3-8b-chat-hf',
        costPerMillionTokens: 0.2
    },
    qwen_4b: {
        tier: 'free',
        identifier: 'Qwen/Qwen1.5-4B-Chat',
        costPerMillionTokens: 0.1
    },
    qwen_7b: {
        tier: 'free',
        identifier: 'Qwen/Qwen1.5-7B-Chat',
        costPerMillionTokens: 0.2
    },
    qwen_14b: {
        tier: 'free',
        identifier: 'Qwen/Qwen1.5-14B-Chat',
        costPerMillionTokens: 0.3
    },
    mistral_7b_v1: {
        tier: 'free',
        identifier: 'mistralai/Mistral-7B-Instruct-v0.1',
        costPerMillionTokens: 0.1
    },*/
    mistral_7b_v2: {
        tier: 'free',
        name: 'Mistral Entry',
        identifier: 'mistralai/Mistral-7B-Instruct-v0.2',
        costPerMillionTokens: 0.2
    },
    llama_3_70b: {
        tier: 'pro',
        name: 'Llama Expert',
        identifier: 'meta-llama/Llama-3-70b-chat-hf',
        costPerMillionTokens: 0.9
    },
    qwen_32b: {
        tier: 'pro',
        name: 'Qwen Advanced',
        identifier: 'Qwen/Qwen1.5-32B-Chat',
        costPerMillionTokens: 0.8
    },
    qwen_72b: {
        tier: 'pro',
        name: 'Qwen Summit',
        identifier: 'Qwen/Qwen1.5-72B-Chat',
        costPerMillionTokens: 0.9
    },
    mixtral_8x7b: {
        tier: 'pro',
        name: 'Mixtral Synthesis',
        identifier: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        costPerMillionTokens: 0.6
    },
    /*mixtral_8x22b: {
        tier: 'ultra',
        identifier: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
        costPerMillionTokens: 1.2
    },
    qwen_110b: {
        tier: 'ultra',
        identifier: 'Qwen/Qwen1.5-110B-Chat',
        costPerMillionTokens: 1.8
    },
    snowflake_arctic: {
        tier: 'ultra',
        identifier: 'Snowflake/snowflake-arctic-instruct',
        costPerMillionTokens: 2.4
    }*/
};

export default models;
