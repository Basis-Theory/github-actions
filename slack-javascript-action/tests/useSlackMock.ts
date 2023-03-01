import { AxiosRequestConfig } from "axios";
import MockAdapter from "axios-mock-adapter";

const mockCreateMessage = (mock: MockAdapter) => () => {
  mock
    .onPost("https://slack.com/api/chat.postMessage")
    .reply((config: AxiosRequestConfig) => {
      expect(config).toMatchSnapshot();

      return [
        200,
        {
          ts: "created message id",
        },
      ];
    });
};

const mockUpdateMessage = (mock: MockAdapter) => () => {
  mock.onPost("https://slack.com/api/chat.update").reply((config) => {
    expect(config).toMatchSnapshot();

    return [
      200,
      {
        ts: "updated message id",
      },
    ];
  });
};

export default (mock: MockAdapter) => ({
  mockCreateMessage: mockCreateMessage(mock),
  mockUpdateMessage: mockUpdateMessage(mock),
});
