/**
 * TAMV Social Wall - Muro Global con Economía Dual (TAMV-T + TGN)
 * Integra superlikes pagados, insignias, DreamSpaces y gobernanza comunitaria
 * 
 * Arquitectura: L0-L3 (Social/Economic) + L6 (XR) sobre OS civilizacional TAMV
 */

// ============================================================================
// TIPOS BASE DEL MURO GLOBAL
// ============================================================================

export type ContentKind =
  | "text"
  | "image" 
  | "video"
  | "audio"
  | "dreamspace"
  | "course"
  | "contribution"
  | "sensory_concert"
  | "art"
  | "culture"
  | "reel"
  | "stream"
  | "story"
  | "call"; // videollamada programada o sala

export type VisibilityMode =
  | "PUBLIC_FREE"          // visible sin pagar
  | "LOCKED_PREVIEW"       // se ve blur/censura, desbloqueo pagando
  | "SUBSCRIBERS_ONLY"     // solo seguidores premium
  | "OWNER_ONLY";          // borrado efectivo para otros

export interface PostMonetizationConfig {
  visibilityMode: VisibilityMode;
  unlockPriceTamv?: number;
  subscriptionPriceMonthlyTamv?: number;
  accessDurationDays?: number;
}

export interface PostEngagementStats {
  tachidosCount: number;       // likes gratuitos
  tadehuevCount: number;       // superlikes pagados (5 TAMV-T)
  commentsCount: number;
  sharesCount: number;
  revenueCreatorTamv: number;
  revenuePlatformTamv: number;
  badgesUsedCount: number;
  badgesRevenueUsd: number;    // dinero fiat equivalente
}

export interface PostGovernanceMeta {
  governanceWeightTgn: number;        // peso de voto en procesos comunitarios
  stakedTgnByAuthor: number;          // TGN bloqueados por el creador
  stakedTgnByCommunity: number;       // TGN bloqueados por la comunidad
  curationStatus: "PENDING" | "APPROVED" | "FLAGGED" | "SANCTIONED";
}

export interface XRExperienceRef {
  id: string;
  type: "dreamspace" | "sensory_concert";
  sceneId: string;
  audioSceneId?: string;
  emotionPreset?: "calm" | "euphoric" | "melancholic" | "tribal" | "ancestral";
}

export interface Post {
  id: string;
  authorId: string;
  kind: ContentKind;
  text?: string;
  mediaUrls?: string[];
  dreamspaceRefId?: string;
  xrRef?: XRExperienceRef;
  createdAt: string;
  updatedAt?: string;
  monetization: PostMonetizationConfig;
  engagement: PostEngagementStats;
  governance?: PostGovernanceMeta;
  // flags de moderación ética (KEC)
  isCensoredForPublic: boolean;
  ethicalScore: number;        // salida del Kernel Ético Central
  riskScore: number;
}

// ============================================================================
// SISTEMA DE INSIGNIAS Y COMENTARIOS
// ============================================================================

export interface CommentBadge {
  id: string;
  name: string;
  priceUsd: number;          // 5 USD fijo
  visualTheme: {
    textColor: string;
    backgroundColor: string;
    glowEffect: boolean;
    particleEffect?: "none" | "aura" | "holo" | "fire" | "water";
  };
  audioTheme?: {
    soundId: string;         // referencia a KAOS Audio 3D
    volume: number;
  };
  priorityBoost: number;     // cuánto sube en el ranking
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: string;
  tachidosCount: number;
  tadehuevCount: number;
  badgeId?: string;
  badgeAppliedAt?: string;
  priorityScore: number;
}

// ============================================================================
// WALLETS Y ECONOMÍA DUAL
// ============================================================================

export interface WalletState {
  userId: string;
  balanceTamv: number;       // TAMV-T (uso diario)
  balanceTgn: number;        // TGN (gobernanza)
  stakedTgn: number;         // TGN bloqueados en stakes
}

export interface EconomicParams {
  tadehuevPriceTamv: number;           // 5 TAMV-T por defecto
  creatorShare: number;                // 0.75 (75%)
  platformShare: number;               // 0.25 (25%)
  badgePriceUsd: number;              // 5 USD
  courseBaseRoyaltyShare: number;
  sensoryConcertRoyaltyShare: number;
  lastUpdatedByProposalId: string;
}

// ============================================================================
// PRODUCTOS TAMV (CURSOS Y CONCIERTOS)
// ============================================================================

export type ProductKind = "COURSE" | "SENSORY_CONCERT";

export interface TamvProduct {
  id: string;
  kind: ProductKind;
  authorId: string;
  title: string;
  description: string;
  coverUrl: string;
  postId: string;              // asociar al Post del muro
  priceTamv: number;
  soldUnits: number;
  revenueCreatorTamv: number;
  revenuePlatformTamv: number;
  accessDurationDays?: number;
}

// ============================================================================
// LÓGICAS DE VISIBILIDAD Y CENSURA ÉTICA
// ============================================================================

export function getRenderablePostForViewer(params: {
  post: Post;
  viewerId: string | null;
  viewerHasPaidUnlock: boolean;
  viewerIsSubscriber: boolean;
  viewerIsAuthor: boolean;
}): {
  canViewFull: boolean;
  showBlur: boolean;
  showPaywallBanner: boolean;
  showCensoredNotice: boolean;
} {
  const { post, viewerHasPaidUnlock, viewerIsSubscriber, viewerIsAuthor } = params;

  // Autor siempre ve full
  if (viewerIsAuthor) {
    return {
      canViewFull: true,
      showBlur: false,
      showPaywallBanner: false,
      showCensoredNotice: post.isCensoredForPublic,
    };
  }

  // Contenido censurado globalmente por KEC (riesgo/ética)
  if (post.isCensoredForPublic && !viewerHasPaidUnlock) {
    return {
      canViewFull: false,
      showBlur: true,
      showPaywallBanner: true,
      showCensoredNotice: true,
    };
  }

  switch (post.monetization.visibilityMode) {
    case "PUBLIC_FREE":
      return {
        canViewFull: true,
        showBlur: false,
        showPaywallBanner: false,
        showCensoredNotice: post.isCensoredForPublic,
      };

    case "LOCKED_PREVIEW":
      if (viewerHasPaidUnlock) {
        return {
          canViewFull: true,
          showBlur: false,
          showPaywallBanner: false,
          showCensoredNotice: post.isCensoredForPublic,
        };
      }
      return {
        canViewFull: false,
        showBlur: true,
        showPaywallBanner: true,
        showCensoredNotice: post.isCensoredForPublic,
      };

    case "SUBSCRIBERS_ONLY":
      if (viewerIsSubscriber) {
        return {
          canViewFull: true,
          showBlur: false,
          showPaywallBanner: false,
          showCensoredNotice: post.isCensoredForPublic,
        };
      }
      return {
        canViewFull: false,
        showBlur: true,
        showPaywallBanner: true,
        showCensoredNotice: post.isCensoredForPublic,
      };

    case "OWNER_ONLY":
    default:
      return {
        canViewFull: false,
        showBlur: true,
        showPaywallBanner: false,
        showCensoredNotice: true,
      };
  }
}

// ============================================================================
// LÓGICAS ECONÓMICAS: SUPERLIKES (TADEHUEV) Y TACHIDOS
// ============================================================================

const DEFAULT_ECONOMIC_PARAMS: EconomicParams = {
  tadehuevPriceTamv: 5,
  creatorShare: 0.75,
  platformShare: 0.25,
  badgePriceUsd: 5,
  courseBaseRoyaltyShare: 0.75,
  sensoryConcertRoyaltyShare: 0.75,
  lastUpdatedByProposalId: "genesis",
};

export interface TadehuevResult {
  post: Post;
  senderWallet: WalletState;
  creatorWallet: WalletState;
  platformWallet: WalletState;
}

// Tachido normal (like gratuito)
export function giveTachido(post: Post): Post {
  return {
    ...post,
    engagement: {
      ...post.engagement,
      tachidosCount: post.engagement.tachidosCount + 1,
    },
  };
}

// Superlike de paga (tadehuev)
export function giveTadehuev(
  params: {
    post: Post;
    senderWallet: WalletState;
    creatorWallet: WalletState;
    platformWallet: WalletState;
  },
  economicParams: EconomicParams = DEFAULT_ECONOMIC_PARAMS
): TadehuevResult {
  const { post, senderWallet, creatorWallet, platformWallet } = params;

  if (senderWallet.balanceTamv < economicParams.tadehuevPriceTamv) {
    throw new Error("Saldo TAMV-T insuficiente para tadehuev (superlike).");
  }

  const creatorAmount = economicParams.tadehuevPriceTamv * economicParams.creatorShare;
  const platformAmount = economicParams.tadehuevPriceTamv * economicParams.platformShare;

  const updatedSender: WalletState = {
    ...senderWallet,
    balanceTamv: senderWallet.balanceTamv - economicParams.tadehuevPriceTamv,
  };

  const updatedCreator: WalletState = {
    ...creatorWallet,
    balanceTamv: creatorWallet.balanceTamv + creatorAmount,
  };

  const updatedPlatform: WalletState = {
    ...platformWallet,
    balanceTamv: platformWallet.balanceTamv + platformAmount,
  };

  const updatedPost: Post = {
    ...post,
    engagement: {
      ...post.engagement,
      tadehuevCount: post.engagement.tadehuevCount + 1,
      revenueCreatorTamv: post.engagement.revenueCreatorTamv + creatorAmount,
      revenuePlatformTamv: post.engagement.revenuePlatformTamv + platformAmount,
    },
  };

  return {
    post: updatedPost,
    senderWallet: updatedSender,
    creatorWallet: updatedCreator,
    platformWallet: updatedPlatform,
  };
}

// ============================================================================
// SISTEMA DE INSIGNIAS EN COMENTARIOS
// ============================================================================

export function computeCommentPriorityScore(params: {
  comment: Comment;
  badge?: CommentBadge;
}): number {
  const { comment, badge } = params;
  const baseEngagement = comment.tachidosCount * 1 + comment.tadehuevCount * 3;
  const badgeBoost = badge ? badge.priorityBoost : 0;
  return baseEngagement + badgeBoost;
}

export function sortCommentsForDisplay(
  comments: Comment[],
  badges: Record<string, CommentBadge>
): Comment[] {
  return [...comments]
    .map((c) => {
      const badge = c.badgeId ? badges[c.badgeId] : undefined;
      return {
        ...c,
        priorityScore: computeCommentPriorityScore({ comment: c, badge }),
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export interface BadgePurchaseResult {
  comment: Comment;
  platformWallet: WalletState;
  badgesRevenueUsdTotal: number;
}

export function applyBadgeToComment(params: {
  comment: Comment;
  badge: CommentBadge;
  platformWallet: WalletState;
  usdToTamvRate: number; // oráculo FX
  badgesRevenueUsdTotal: number;
}): BadgePurchaseResult {
  const { comment, badge, platformWallet, usdToTamvRate, badgesRevenueUsdTotal } = params;

  // 100% del valor va a TAMV (plataforma)
  const platformTamvAmount = badge.priceUsd * usdToTamvRate;

  const updatedPlatformWallet: WalletState = {
    ...platformWallet,
    balanceTamv: platformWallet.balanceTamv + platformTamvAmount,
  };

  const updatedComment: Comment = {
    ...comment,
    badgeId: badge.id,
    badgeAppliedAt: new Date().toISOString(),
  };

  return {
    comment: updatedComment,
    platformWallet: updatedPlatformWallet,
    badgesRevenueUsdTotal: badgesRevenueUsdTotal + badge.priceUsd,
  };
}

// ============================================================================
// GOBERNANZA CON TOKEN TGN
// ============================================================================

export function stakeTgnOnPostByAuthor(params: {
  post: Post;
  authorWalletTgn: number;
  amountTgn: number;
}): { post: Post; authorWalletTgn: number } {
  const { post, authorWalletTgn, amountTgn } = params;
  
  if (authorWalletTgn < amountTgn) {
    throw new Error("TGN insuficiente para stake");
  }

  const updatedPost: Post = {
    ...post,
    governance: {
      ...(post.governance ?? {
        governanceWeightTgn: 0,
        stakedTgnByAuthor: 0,
        stakedTgnByCommunity: 0,
        curationStatus: "PENDING",
      }),
      stakedTgnByAuthor: (post.governance?.stakedTgnByAuthor ?? 0) + amountTgn,
      governanceWeightTgn: (post.governance?.governanceWeightTgn ?? 0) + amountTgn * 2, // autor pesa doble
    },
  };

  return {
    post: updatedPost,
    authorWalletTgn: authorWalletTgn - amountTgn,
  };
}

export function stakeTgnOnPostByCommunity(params: {
  post: Post;
  userWalletTgn: number;
  amountTgn: number;
  direction: "UPVOTE" | "DOWNVOTE";
}): { post: Post; userWalletTgn: number } {
  const { post, userWalletTgn, amountTgn, direction } = params;
  
  if (userWalletTgn < amountTgn) {
    throw new Error("TGN insuficiente para stake comunitario");
  }

  const sign = direction === "UPVOTE" ? 1 : -1;
  const updatedWeight = (post.governance?.governanceWeightTgn ?? 0) + sign * amountTgn;

  const updatedPost: Post = {
    ...post,
    governance: {
      ...(post.governance ?? {
        governanceWeightTgn: 0,
        stakedTgnByAuthor: 0,
        stakedTgnByCommunity: 0,
        curationStatus: "PENDING",
      }),
      stakedTgnByCommunity: (post.governance?.stakedTgnByCommunity ?? 0) + amountTgn,
      governanceWeightTgn: updatedWeight,
    },
  };

  return {
    post: updatedPost,
    userWalletTgn: userWalletTgn - amountTgn,
  };
}

// ============================================================================
// PRODUCTOS TAMV (CURSOS Y CONCIERTOS)
// ============================================================================

export interface PurchaseResult {
  product: TamvProduct;
  buyerWalletTamv: number;
  creatorWalletTamv: number;
  platformWalletTamv: number;
}

export function buyTamvProduct(
  params: {
    product: TamvProduct;
    buyerWalletTamv: number;
    creatorWalletTamv: number;
    platformWalletTamv: number;
  },
  economicParams: EconomicParams = DEFAULT_ECONOMIC_PARAMS
): PurchaseResult {
  const { product, buyerWalletTamv, creatorWalletTamv, platformWalletTamv } = params;

  if (buyerWalletTamv < product.priceTamv) {
    throw new Error("TAMV-T insuficiente para comprar este producto.");
  }

  const creatorAmount = product.priceTamv * economicParams.creatorShare;
  const platformAmount = product.priceTamv * economicParams.platformShare;

  const updatedBuyerWallet = buyerWalletTamv - product.priceTamv;
  const updatedCreatorWallet = creatorWalletTamv + creatorAmount;
  const updatedPlatformWallet = platformWalletTamv + platformAmount;

  const updatedProduct: TamvProduct = {
    ...product,
    soldUnits: product.soldUnits + 1,
    revenueCreatorTamv: product.revenueCreatorTamv + creatorAmount,
    revenuePlatformTamv: product.revenuePlatformTamv + platformAmount,
  };

  return {
    product: updatedProduct,
    buyerWalletTamv: updatedBuyerWallet,
    creatorWalletTamv: updatedCreatorWallet,
    platformWalletTamv: updatedPlatformWallet,
  };
}

// ============================================================================
// ORQUESTADOR DEL FEED GLOBAL
// ============================================================================

export interface FeedContext {
  viewerId: string | null;
  viewerSubscriptions: string[]; // autores suscritos
  viewerPaidUnlocks: string[];   // postIds desbloqueados
  viewerIsGuardianOrAdmin: boolean;
}

export function computePostScoreForFeed(post: Post): number {
  const engagementWeight =
    post.engagement.tachidosCount * 1 +
    post.engagement.tadehuevCount * 4 +
    post.engagement.commentsCount * 2 +
    post.engagement.sharesCount * 3;

  const economicsWeight =
    post.engagement.revenueCreatorTamv +
    post.engagement.revenuePlatformTamv * 0.5;

  // ética: penaliza riesgo alto, premia ethicalScore elevado
  const ethicsWeight = post.ethicalScore - post.riskScore;

  return engagementWeight + economicsWeight + ethicsWeight;
}

export function applyGovernanceBoostToPostScore(
  baseScore: number,
  post: Post
): number {
  const gov = post.governance;
  if (!gov) return baseScore;

  // peso de TGN, pero con penalización si está flaggeado
  const tgnInfluence = Math.log10(1 + Math.abs(gov.governanceWeightTgn));
  const flagPenalty = gov.curationStatus === "FLAGGED" ? -5 : 0;
  const sanctionedPenalty = gov.curationStatus === "SANCTIONED" ? -20 : 0;

  return baseScore + tgnInfluence * 3 + flagPenalty + sanctionedPenalty;
}

export function buildGlobalWallFeed(
  posts: Post[],
  ctx: FeedContext
): Post[] {
  return posts
    .map((p) => {
      const viewerIsAuthor = p.authorId === ctx.viewerId;
      const viewerHasPaidUnlock = ctx.viewerPaidUnlocks.includes(p.id);
      const viewerIsSubscriber = ctx.viewerSubscriptions.includes(p.authorId);

      const visibility = getRenderablePostForViewer({
        post: p,
        viewerId: ctx.viewerId,
        viewerHasPaidUnlock,
        viewerIsSubscriber,
        viewerIsAuthor,
      });

      const hiddenForViewer =
        !visibility.canViewFull && !visibility.showBlur && !viewerIsAuthor;

      const baseScore = computePostScoreForFeed(p);
      const finalScore = applyGovernanceBoostToPostScore(baseScore, p);

      return {
        post: p,
        visibility,
        hiddenForViewer,
        score: finalScore,
      };
    })
    .filter((x) => !x.hiddenForViewer)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.post);
}

// ============================================================================
// DREAMSPACES Y XR INTEGRATION
// ============================================================================

export interface DreamspaceUploadPayload {
  title: string;
  description: string;
  thumbnailUrl: string;
  sceneFileUrl: string;
  audioPresetId?: string;
  emotionPreset: "calm" | "euphoric" | "melancholic" | "tribal" | "ancestral";
  visibilityMode: VisibilityMode;
  unlockPriceTamv?: number;
}

export async function createDreamspacePost(
  payload: DreamspaceUploadPayload,
  authorId: string
): Promise<Post> {
  // Generar ID único para la escena XR
  const xrSceneId = crypto.randomUUID();

  const newPost: Post = {
    id: crypto.randomUUID(),
    authorId,
    kind: "dreamspace",
    text: payload.description,
    mediaUrls: [payload.thumbnailUrl],
    dreamspaceRefId: xrSceneId,
    xrRef: {
      id: xrSceneId,
      type: "dreamspace",
      sceneId: payload.sceneFileUrl,
      audioSceneId: payload.audioPresetId,
      emotionPreset: payload.emotionPreset,
    },
    createdAt: new Date().toISOString(),
    monetization: {
      visibilityMode: payload.visibilityMode,
      unlockPriceTamv: payload.unlockPriceTamv,
    },
    engagement: {
      tachidosCount: 0,
      tadehuevCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      revenueCreatorTamv: 0,
      revenuePlatformTamv: 0,
      badgesUsedCount: 0,
      badgesRevenueUsd: 0,
    },
    isCensoredForPublic: false,
    ethicalScore: 0,
    riskScore: 0,
  };

  return newPost;
}

// ============================================================================
// UTILIDADES Y HELPERS
// ============================================================================

export function createComment(params: {
  post: Post;
  authorId: string;
  text: string;
}): { post: Post; comment: Comment } {
  const { post, authorId, text } = params;
  
  const comment: Comment = {
    id: crypto.randomUUID(),
    postId: post.id,
    authorId,
    text,
    createdAt: new Date().toISOString(),
    tachidosCount: 0,
    tadehuevCount: 0,
    priorityScore: 0,
  };

  const updatedPost: Post = {
    ...post,
    engagement: {
      ...post.engagement,
      commentsCount: post.engagement.commentsCount + 1,
    },
  };

  return { post: updatedPost, comment };
}

export function registerShare(post: Post): Post {
  return {
    ...post,
    engagement: {
      ...post.engagement,
      sharesCount: post.engagement.sharesCount + 1,
    },
  };
}

// ============================================================================
// EXPORTACIONES PRINCIPALES
// ============================================================================

export {
  DEFAULT_ECONOMIC_PARAMS,
  type Post,
  type Comment,
  type CommentBadge,
  type WalletState,
  type TamvProduct,
  type DreamspaceUploadPayload,
  type FeedContext,
};