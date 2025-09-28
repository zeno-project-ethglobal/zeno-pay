import { ethers } from "ethers";

// ---------------- CONFIG ----------------
const GO_RPC_URL = "https://uninterpretively-unhabited-emelda.ngrok-free.dev";// your Go node RPC
const PROVIDER_URL = "https://polygon-amoy.infura.io/v3/d3f2faff221c400f933eef1931379bce";
const ZENOPAY_CONTRACT = "0x085D2c5c267EA2a40902aeA08385059032f881B8";

const ZENOPAY_ABI = [
  "function transferValue(address from, address to, uint256 value)",
  "function is2FARequired(address from, uint256 value, bytes data) view returns (bool)",
];

// ---------------- TYPES ----------------
export interface UserInfo {
  dkg_eoa: string;
  value_threshold: string;
  nullifier: string;
}

export interface TxPayload {
  from: string;
  to: string;
  value: string; // decimal string
  data: string;  // hex calldata
  v?: number;
  r?: string;
  s?: string;
  proof?: string;
}

// ---------------- HELPERS ----------------

// 1. Get user info from Go RPC
export async function getUserInfo(id: string): Promise<UserInfo> {
  const payload = { method: "get_user_info", params: [id] };

  const res = await fetch(GO_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result as UserInfo;
}

// 2. Encode transferValue call for Zenopay
export function encodeTransferValue(from: string, recipient: string, amount: bigint): string {
  const iface = new ethers.Interface(ZENOPAY_ABI);
  return iface.encodeFunctionData("transferValue", [from, recipient, amount]);
}

// 3. Check is2FARequired on-chain
export async function checkIs2FARequired(from: string, value: bigint, data: string): Promise<boolean> {
  const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  const contract = new ethers.Contract(ZENOPAY_CONTRACT, ZENOPAY_ABI, provider);
  return contract.is2FARequired(from, value, data);
}

// 4. Compute digest like Go’s computeTxHash (keccak256 of from || to || value || data)
function computeDigest(tx: TxPayload): string {
  const from = ethers.getAddress(tx.from);
  const to = ethers.getAddress(tx.to);
  const value = BigInt(tx.value);
  const encoded = ethers.concat([
    ethers.getBytes(from),
    ethers.getBytes(to),
    ethers.zeroPadBytes(ethers.toBeHex(value), 32),
    ethers.getBytes(tx.data || "0x"),
  ]);
  return ethers.keccak256(encoded);
}

// 5. Sign + send tx to Go RPC
export async function sendTransaction(tx: TxPayload, password: string, proof?: string) {
  // derive EOA from password (same as Go code)
  const pwdHash = ethers.keccak256(ethers.toUtf8Bytes(password));
  const wallet = new ethers.Wallet(pwdHash);

  // sign digest
  const digest = computeDigest(tx);
  const sig = wallet.signingKey.sign(digest);

  const payload = {
    method: "send_transaction",
    params: [
      {
        ...tx,
        v: Number(sig.v),
        r: ethers.hexlify(sig.r),
        s: ethers.hexlify(sig.s),
        ...(proof ? { proof } : {}),
      },
    ],
  };

  const res = await fetch(GO_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

// ---------------- MAIN FLOW ----------------

// Full helper: id -> dkg -> check 2FA -> send or defer
export async function processTransaction(
  receiverId: string,
  amount: bigint,
) {
  // 1. get receiver’s DKG
  const userInfo = await getUserInfo(receiverId);
  const receiverDKG = userInfo.dkg_eoa;

  // 2. build tx
  const password = localStorage.getItem('userPassword')!
  const payer = localStorage.getItem("zenopay-dkg-eoa")!
  const from = payer;
  const to = ZENOPAY_CONTRACT;
   const valueInWei = ethers.parseUnits(amount.toString(), 18);
  const data = encodeTransferValue(from, receiverDKG, valueInWei);

  // 3. check 2FA

  const need2FA = await checkIs2FARequired(from, BigInt(0), data);

  if (!need2FA) {
    // 4a. send directly
    return sendTransaction({ from, to, value: "0", data }, password);
  } else {
    // 4b. save pending tx context and return
    const pending = { from, to, value: "0", data, recipient: receiverDKG, amount: amount.toString(), password };
    localStorage.setItem("pendingTx", JSON.stringify(pending));
    return { status: "2fa_required" };
  }
}

// To use on /2fa page
export async function finalizeWith2FA(proof: string) {
  const pending = JSON.parse(localStorage.getItem("pendingTx")!);
  if (!pending) throw new Error("No pending tx in storage");

  const tx: TxPayload = {
    from: pending.from,
    to: pending.to,
    value: pending.value,
    data: pending.data,
  };

  const result = await sendTransaction(tx, pending.password, proof);
  localStorage.removeItem("pendingTx");
  return result;
}