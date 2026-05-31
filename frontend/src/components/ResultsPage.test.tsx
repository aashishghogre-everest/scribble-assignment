import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

describe("ResultsPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and displays last round summary", async () => {
    const mockRoom = { code: "ABCD", status: "lobby", participants: [] };

    vi.doMock("../state/roomStore", () => ({
      useRoomState: () => ({ room: mockRoom, participantId: "p1" }),
      useRoomStore: () => ({ fetchRoom: async () => {} })
    }));

    const mockSummary = {
      lastRoundSummary: {
        word: "apple",
        finalScores: [{ participantId: "p1", score: 100 }],
        guesses: [
          {
            playerId: "p1",
            textTrimmed: "apple",
            timestamp: "t1",
            isCorrect: true
          }
        ]
      }
    };

    vi.doMock("../services/api", () => ({
      api: { getLastRoundSummary: async () => mockSummary }
    }));

    const { default: ResultsPage } = await import("./ResultsPage");

    render(React.createElement(ResultsPage), {
      wrapper: ({ children }) => React.createElement(MemoryRouter, {}, children)
    });

    expect(await screen.findByText("Round Results")).toBeTruthy();
    const apples = await screen.findAllByText("apple");
    expect(apples.length).toBeGreaterThanOrEqual(1);
    expect(await screen.findByText(/100/)).toBeTruthy();
  });
});
