type AdviceSlipResponse = {
  slip: {
    id: number;
    advice: string;
  };
};

export type AdviceSlip = AdviceSlipResponse['slip'];

export function getAdviceSlip() {
  return fetch('https://api.adviceslip.com/advice', { cache: 'no-store' })
    .then<AdviceSlipResponse>(response => response.json())
    .then(response => response.slip);
}
