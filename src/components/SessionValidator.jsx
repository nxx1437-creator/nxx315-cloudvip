import useSession from "../hooks/useSession";
import useSessionValidator from "../hooks/useSessionValidator";

export default function SessionValidator() {
  const { session } = useSession();
  const isLoggedIn = !!session?.user;

  useSessionValidator(isLoggedIn);

  return null;
}
