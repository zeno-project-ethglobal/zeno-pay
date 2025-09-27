export interface UserLoginParams {
  rpcUrl: string;
  id: string;
  proof: string; // zk proof base64
}

/**
 * Calls the ⁠ user_login ⁠ RPC method on your node.
 * @param rpcUrl Node RPC endpoint (e.g. http://localhost:8001)
 * @param id User ID
 * @param proof zk proof in base64 format
 */
export async function userLogin({
  rpcUrl,
  id,
  proof,
}: UserLoginParams): Promise<any> {
  // Build RPC payload
  const payload = {
    method: "user_login",
    params: [
      {
        id,
        proof,
      },
    ],
  };

  // Call node RPC
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  return res.json();
}