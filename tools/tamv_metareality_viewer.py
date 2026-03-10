"""Visualizador metarreal TAMV.

Módulo base para representar la metarrealidad TAMV en 3D y generar
animaciones de cámara orbital. Diseñado para extenderse con datos reales
(MSR, BookPI, infraestructura, gobernanza y user trails).
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.animation import FuncAnimation
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401 - side-effect: register 3D projection


@dataclass(frozen=True)
class ViewerConfig:
    """Parámetros del visualizador metarreal."""

    worlds: int = 8
    user_trails: int = 40
    events: int = 6
    point_radius: float = 30.0
    seed: int | None = 42


@dataclass(frozen=True)
class RenderedState:
    """Estructuras generadas para reutilización y testeo."""

    world_centers: np.ndarray
    event_points: np.ndarray


def _get_rng(seed: int | None) -> np.random.Generator:
    return np.random.default_rng(seed)


def create_metareality_figure(config: ViewerConfig = ViewerConfig()) -> tuple[plt.Figure, Axes3D, RenderedState]:
    """Construye figura 3D base con capas visuales de metarrealidad."""

    rng = _get_rng(config.seed)

    fig = plt.figure(figsize=(10, 10))
    ax = fig.add_subplot(111, projection="3d")

    fig.patch.set_facecolor("black")
    ax.set_facecolor("black")

    lim = config.point_radius
    ax.set_xlim(-lim, lim)
    ax.set_ylim(-lim, lim)
    ax.set_zlim(-lim, lim)

    # SYSTEM_CORE: espiral central
    theta = np.linspace(0, 20 * np.pi, 2000)
    z = np.linspace(-25, 25, 2000)
    r = 0.3 * theta
    x = r * np.cos(theta)
    y = r * np.sin(theta)
    ax.plot(x, y, z, color="cyan", linewidth=0.7, alpha=0.9)

    world_centers: list[np.ndarray] = []

    # WORLD_LAYERS: esferas translúcidas
    for _ in range(config.worlds):
        center = rng.uniform(-20, 20, 3)
        world_centers.append(center)
        radius = float(rng.uniform(2, 5))

        u = np.linspace(0, 2 * np.pi, 30)
        v = np.linspace(0, np.pi, 30)

        xs = radius * np.outer(np.cos(u), np.sin(v)) + center[0]
        ys = radius * np.outer(np.sin(u), np.sin(v)) + center[1]
        zs = radius * np.outer(np.ones(np.size(u)), np.cos(v)) + center[2]

        ax.plot_surface(xs, ys, zs, alpha=0.08, color="blue", linewidth=0)

    # USER_TRAILS: trayectorias energéticas
    for _ in range(config.user_trails):
        pts = rng.uniform(-25, 25, (50, 3))
        ax.plot(pts[:, 0], pts[:, 1], pts[:, 2], color="orange", alpha=0.35, linewidth=0.9)

    # GOVERNANCE/CRISIS EVENTS
    events = rng.uniform(-20, 20, (config.events, 3))
    ax.scatter(events[:, 0], events[:, 1], events[:, 2], color="red", s=60, alpha=0.95)

    # Estética diegética
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_zticks([])
    ax.grid(False)

    state = RenderedState(world_centers=np.array(world_centers), event_points=events)
    return fig, ax, state


def animate_metareality(
    save_path: str | None = None,
    frames: int = 360,
    config: ViewerConfig = ViewerConfig(),
    show: bool = True,
) -> FuncAnimation:
    """Genera animación orbital de la metarrealidad TAMV.

    Args:
        save_path: si se define, guarda una captura PNG del frame inicial.
        frames: cantidad de frames de rotación.
        config: parámetros de escena.
        show: muestra ventana interactiva si True.
    """

    fig, ax, _ = create_metareality_figure(config=config)

    def update(frame: int) -> None:
        ax.view_init(elev=20, azim=frame * 0.6)

    animation = FuncAnimation(fig, update, frames=frames, interval=30)

    if save_path:
        out = Path(save_path)
        out.parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(out, dpi=200, facecolor="black")

    if show:
        plt.show()
    else:
        plt.close(fig)

    return animation


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="TAMV metareality viewer")
    parser.add_argument("--save", type=str, default="", help="Ruta para guardar frame inicial PNG")
    parser.add_argument("--frames", type=int, default=360, help="Cantidad de frames de animación")
    parser.add_argument("--seed", type=int, default=42, help="Semilla aleatoria")
    parser.add_argument("--no-show", action="store_true", help="No abrir ventana interactiva")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    # Usa backend no interactivo cuando no se abre UI (útil para CI/headless)
    if args.no_show:
        plt.switch_backend("Agg")

    cfg = ViewerConfig(seed=args.seed)
    save = args.save or None
    animate_metareality(save_path=save, frames=args.frames, config=cfg, show=not args.no_show)


if __name__ == "__main__":
    main()
