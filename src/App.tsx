import SignInWithBrickBreaker from "@/strategies/brick-breaker/SignInWithBrickBreaker";
import Header from "./components/common/Header";

export default function homepage() {
  return (
    <>
      <Header />
      <SignInWithBrickBreaker />
    </>
  );
}
