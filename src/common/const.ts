export const PROD = true;

export const ApiUrl = PROD
  ? 'https://api.metasalt.io/prod'
  : 'https://api.metasalt.io/dev';

export const StripePublishableKey = PROD
  ? 'pk_live_51NGRnaLXiqcRGeqX47yr9ouSxZRTaNh8ghmltbFMtZfDdrvyxmjt9DrZqhwh1QcQFbe02RgrH6bxksSVE80XPCDR00bCWlQCAt'
  : 'pk_test_51NGRnaLXiqcRGeqX6kkHi1BbDz7CQgEp0hHuWTeNopkNmEEG1rDMvhon8vUqZFLT1yEMZAwaF6x6YixXXhVlMyTD00rkNXddDn';

export const Web3AuthClientId = PROD
  ? 'BJGy37KA2f2kEBN0ZtB-DmbZU4C4XEwADS9_hql9h4ggT08RXF1nhcthPMqRk3bRzGxosvEnxn4FBC1og8ZrO9w'
  : 'BDyQYmb1hUIhfATvR9R2DEsESLMgvvi2Jw1i7Bui9QJrl0W8mrASrWo7VHyVYrcxVuOfyi8m-WMkXsKU7-rGPj8';
