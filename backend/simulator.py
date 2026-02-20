from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Dict, List


@dataclass(frozen=True)
class Pose:
    x: float
    y: float
    theta: float


class RobotSimulator:
    """Simple occupancy-grid + circular robot motion simulator."""

    def __init__(self, width: int = 80, height: int = 60, resolution: float = 0.05) -> None:
        self.width = width
        self.height = height
        self.resolution = resolution
        self.origin_x = -((width * resolution) / 2.0)
        self.origin_y = -((height * resolution) / 2.0)
        self.center_x = 0.0
        self.center_y = 0.0
        self.radius = 1.0
        self.angular_speed = 0.6
        self._grid_data = self._build_grid()

    def _build_grid(self) -> List[int]:
        grid = [0] * (self.width * self.height)

        def index(x: int, y: int) -> int:
            return y * self.width + x

        # Bordered walls.
        for x in range(self.width):
            grid[index(x, 0)] = 100
            grid[index(x, self.height - 1)] = 100
        for y in range(self.height):
            grid[index(0, y)] = 100
            grid[index(self.width - 1, y)] = 100

        # A few rectangular obstacles.
        obstacles = [
            (12, 10, 16, 22),
            (30, 36, 46, 40),
            (56, 14, 70, 18),
            (58, 42, 68, 54),
        ]

        for min_x, min_y, max_x, max_y in obstacles:
            for y in range(min_y, max_y):
                for x in range(min_x, max_x):
                    grid[index(x, y)] = 100

        return grid

    def map_message(self) -> Dict[str, object]:
        return {
            "type": "map",
            "map": {
                "width": self.width,
                "height": self.height,
                "resolution": self.resolution,
                "origin": {
                    "x": self.origin_x,
                    "y": self.origin_y,
                },
                "data": self._grid_data,
            },
        }

    def pose_message(self, t_seconds: float) -> Dict[str, object]:
        angle = self.angular_speed * t_seconds
        x = self.center_x + self.radius * math.cos(angle)
        y = self.center_y + self.radius * math.sin(angle)
        theta = angle + (math.pi / 2.0)

        pose = Pose(x=x, y=y, theta=theta)
        return {
            "type": "pose",
            "pose": {
                "x": pose.x,
                "y": pose.y,
                "theta": pose.theta,
            },
        }
