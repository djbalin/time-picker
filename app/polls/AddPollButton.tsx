"use client";
import { addPoll } from "../actions/polls";

export const AddPollButton = () => {
  return <button onClick={addPoll}>Add poll</button>;
};
