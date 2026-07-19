export const toppings = {
    kimchi: {
        name: "キムチ",
        price: 120,
        effect: (length) => length + 20,
    },

    negi: {
        name: "ねぎ",
        price: 80,
        effect: (length) => length + 10,
    },

    rayu: {
        name: "ラー油",
        price: 150,
        effect: (length) =>
            length + (Math.random() * 40 - 20),
    },

    shiso: {
        name: "青紫蘇ドレッシング",
        price: 300,
        effect: (length) => length * 1.3,
    },

    egg: {
        name: "生卵",
        price: 500,
        effect: (length) => length * 1.5,
    },
};

export function generateStringLength(
    mixCount,
    useKarashi,
    selectedToppings
) {
    let length = Math.sqrt(mixCount) * 8;

    if (useKarashi) {
        length *= 0.9;
    }

    selectedToppings.forEach((id) => {
        length = toppings[id].effect(length);
    });

    const noise = Math.random() * 20 - 10;

    return Math.max(
        5,
        Math.round(length + noise)
    );
}