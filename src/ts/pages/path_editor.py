import sys
import math
import random
import pymunk
from PyQt6.QtWidgets import QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QLabel, QSlider, QGroupBox
from PyQt6.QtCore import Qt, QPointF, pyqtSignal
from PyQt6.QtGui import QPainter, QPen, QColor, QBrush, QFont

# 复用原始脚本的数学函数
def bezier(t, p0, p1, p2, p3):
    return (
        (1 - t) ** 3 * p0
        + 3 * (1 - t) ** 2 * t * p1
        + 3 * (1 - t) * t**2 * p2
        + t**3 * p3
    )

def tangent(t, p0, p1, p2, p3):
    return (
        3 * (1 - t) ** 2 * (p1 - p0)
        + 6 * (1 - t) * t * (p2 - p1)
        + 3 * t**2 * (p3 - p2)
    )

# 模拟数据量 (对应 all_labels 的长度)
NUM_PLANES = 31

class PathCanvas(QWidget):
    changed = pyqtSignal()
    OFFSET = QPointF(100, 50)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setMinimumSize(1300, 950)
        self.setMouseTracking(True)
        
        # 初始几何数据
        self.spine = [QPointF(-15, 740), QPointF(695, 833), QPointF(991, 717), QPointF(1229, 110)]
        self.left_wall = [QPointF(-30, 350), QPointF(906, 659), QPointF(900, 250), QPointF(1207, 54)]
        self.right_wall = [QPointF(-48, 1039), QPointF(427, 967), QPointF(1191, 861), QPointF(1240, 147)]
        self.target_tip = QPointF(1248, 29)
        
        # 初始物理参数
        self.params = {
            "gravity_x": 550,
            "gravity_y": -320,
            "radius": 70,
            "steps_p1": 450,
            "steps_p2": 350
        }
        
        self.dragged_point = None
        self.dragged_list = None
        self.plane_results = []
        self.run_simulation()

    def run_simulation(self):
        space = pymunk.Space()
        space.damping = 0.4
        
        def add_wall(points):
            p = [(pt.x(), pt.y()) for pt in points]
            steps = 15
            prev = (bezier(0, p[0][0], p[1][0], p[2][0], p[3][0]), bezier(0, p[0][1], p[1][1], p[2][1], p[3][1]))
            for i in range(1, steps + 1):
                t = i / steps
                curr = (bezier(t, p[0][0], p[1][0], p[2][0], p[3][0]), bezier(t, p[0][1], p[1][1], p[2][1], p[3][1]))
                seg = pymunk.Segment(space.static_body, prev, curr, 15)
                seg.elasticity = 0.5
                seg.friction = 0.5
                space.add(seg)
                prev = curr

        add_wall(self.left_wall)
        add_wall(self.right_wall)
        
        # 增加一个顶部的挡板，防止飞机飞出
        cap = pymunk.Segment(space.static_body, (1300, -50), (1300, 500), 20)
        space.add(cap)

        bodies = []
        random.seed(42)
        lw = [(pt.x(), pt.y()) for pt in self.left_wall]
        rw = [(pt.x(), pt.y()) for pt in self.right_wall]
        
        for i in range(NUM_PLANES):
            t_spawn = 0.05 + (i / (NUM_PLANES - 1)) * 0.90
            lx = bezier(t_spawn, lw[0][0], lw[1][0], lw[2][0], lw[3][0])
            ly = bezier(t_spawn, lw[0][1], lw[1][1], lw[2][1], lw[3][1])
            rx = bezier(t_spawn, rw[0][0], rw[1][0], rw[2][0], rw[3][0])
            ry = bezier(t_spawn, rw[0][1], rw[1][1], rw[2][1], rw[3][1])
            
            ratio = random.uniform(0.05, 0.95)
            body = pymunk.Body(1, math.inf)
            body.position = (lx*(1-ratio) + rx*ratio, ly*(1-ratio) + ry*ratio)
            # 使用可调半径
            shape = pymunk.Circle(body, self.params["radius"])
            shape.elasticity = 0.1
            shape.friction = 0.7
            space.add(body, shape)
            bodies.append(body)

        # 阶段一：吸引
        space.gravity = (self.params["gravity_x"], self.params["gravity_y"])
        for _ in range(self.params["steps_p1"]): 
            space.step(1/60.0)
            
        # 阶段二：释放
        space.gravity = (0, 0)
        space.damping = 0.1
        for _ in range(self.params["steps_p2"]): 
            space.step(1/60.0)

        self.plane_results = []
        sp = [(pt.x(), pt.y()) for pt in self.spine]
        for b in bodies:
            px, py = b.position.x, b.position.y
            t_approx = max(0.0, min(1.0, (px - sp[0][0]) / (sp[-1][0] - sp[0][0]) if sp[-1][0] != sp[0][0] else 0.5))
            tx = tangent(t_approx, sp[0][0], sp[1][0], sp[2][0], sp[3][0])
            ty = tangent(t_approx, sp[0][1], sp[1][1], sp[2][1], sp[3][1])
            self.plane_results.append((px, py, math.atan2(ty, tx)))
        
        self.update()

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        painter.fillRect(self.rect(), QColor(30, 30, 30))

        painter.save()
        painter.translate(self.OFFSET)

        # 边界
        painter.setPen(QPen(QColor(80, 80, 80), 1, Qt.PenStyle.DashLine))
        painter.drawRect(0, 0, 1280, 950)

        # 路径
        self.draw_path(painter, self.left_wall, QColor(255, 100, 100))
        self.draw_path(painter, self.right_wall, QColor(100, 255, 100))
        self.draw_path(painter, self.spine, QColor(100, 200, 255), dashed=True)

        # 飞机落点
        radius = self.params["radius"]
        for x, y, angle in self.plane_results:
            painter.save()
            painter.translate(x, y)
            painter.rotate(math.degrees(angle) + 180)
            
            # 绘制真实的碰撞体积预览
            painter.setPen(QPen(QColor(100, 150, 255, 50), 1))
            painter.setBrush(QBrush(QColor(100, 150, 255, 20)))
            painter.drawEllipse(QPointF(0,0), radius, radius)
            
            # 绘制飞机图标
            painter.setPen(QPen(QColor(255, 255, 255), 2))
            painter.setBrush(Qt.BrushStyle.NoBrush)
            painter.drawLine(-10, 0, 10, 0)
            painter.drawLine(10, 0, 5, -5)
            painter.drawLine(10, 0, 5, 5)
            painter.restore()

        # 目标点
        painter.setBrush(QBrush(QColor(255, 255, 0)))
        painter.drawEllipse(self.target_tip, 8, 8)
        painter.restore()

    def draw_path(self, painter, pts, color, dashed=False):
        pen = QPen(color, 2)
        if dashed: pen.setStyle(Qt.PenStyle.DashLine)
        painter.setPen(pen)
        steps = 50
        prev = pts[0]
        for i in range(1, steps + 1):
            t = i / steps
            curr = QPointF(bezier(t, pts[0].x(), pts[1].x(), pts[2].x(), pts[3].x()),
                           bezier(t, pts[0].y(), pts[1].y(), pts[2].y(), pts[3].y()))
            painter.drawLine(prev, curr)
            prev = curr
        painter.setPen(QPen(color, 1))
        painter.setBrush(QBrush(QColor(color.red(), color.green(), color.blue(), 100)))
        for i, pt in enumerate(pts):
            painter.drawEllipse(pt, 8, 8)
            painter.drawText(pt + QPointF(10, 10), str(i))

    def mousePressEvent(self, event):
        pos = event.position() - self.OFFSET
        for lst in [self.left_wall, self.right_wall, self.spine]:
            for i, pt in enumerate(lst):
                if (pt - pos).manhattanLength() < 20:
                    self.dragged_point = i
                    self.dragged_list = lst
                    return
        if (self.target_tip - pos).manhattanLength() < 20:
            self.dragged_point = -1
            self.dragged_list = "target"

    def mouseMoveEvent(self, event):
        pos = event.position() - self.OFFSET
        if self.dragged_list == "target": self.target_tip = pos
        elif self.dragged_list is not None: self.dragged_list[self.dragged_point] = pos
        if self.dragged_list: self.update()

    def mouseReleaseEvent(self, event):
        if self.dragged_list:
            self.run_simulation()
            self.changed.emit()
        self.dragged_point = None
        self.dragged_list = None

class EditorWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Mayday Blue Plane Path Editor Pro")
        self.canvas = PathCanvas()
        
        # 布局
        main_widget = QWidget()
        layout = QHBoxLayout(main_widget)
        layout.addWidget(self.canvas, 1)
        
        # 控制面板
        panel = QVBoxLayout()
        panel.setContentsMargins(10, 10, 10, 10)
        
        self.info_label = QLabel()
        self.info_label.setStyleSheet("font-family: monospace; font-size: 11px; color: #0f0; background: black; padding: 10px;")
        panel.addWidget(self.info_label)
        
        # 物理滑杆
        self.add_slider(panel, "Radius (碰撞半径)", 20, 120, "radius")
        self.add_slider(panel, "Gravity X (吸引力X)", 0, 1000, "gravity_x")
        self.add_slider(panel, "Gravity Y (吸引力Y)", -800, 200, "gravity_y")
        self.add_slider(panel, "Steps P1 (阶段1步数)", 50, 1000, "steps_p1")
        self.add_slider(panel, "Steps P2 (阶段2步数)", 50, 1000, "steps_p2")
        
        copy_btn = QPushButton("复制所有代码")
        copy_btn.clicked.connect(self.copy_code)
        panel.addWidget(copy_btn)
        
        panel.addStretch()
        layout.addLayout(panel)
        
        self.setCentralWidget(main_widget)
        self.canvas.changed.connect(self.update_info)
        self.update_info()

    def add_slider(self, layout, name, v_min, v_max, key):
        group = QGroupBox(name)
        l = QVBoxLayout()
        slider = QSlider(Qt.Orientation.Horizontal)
        slider.setRange(v_min, v_max)
        slider.setValue(self.canvas.params[key])
        val_label = QLabel(str(slider.value()))
        
        def on_change(val):
            val_label.setText(str(val))
            self.canvas.params[key] = val
            self.canvas.run_simulation()
            self.update_info()
            
        slider.valueChanged.connect(on_change)
        l.addWidget(val_label)
        l.addWidget(slider)
        group.setLayout(l)
        layout.addWidget(group)

    def format_pts(self, pts):
        return "[" + ", ".join([f"({int(p.x())}, {int(p.y())})" for p in pts]) + "]"

    def update_info(self):
        txt = f"spine = {self.format_pts(self.canvas.spine)}\n"
        txt += f"left_wall = {self.format_pts(self.canvas.left_wall)}\n"
        txt += f"right_wall = {self.format_pts(self.canvas.right_wall)}\n"
        txt += f"TARGET_TIP_POS = ({int(self.canvas.target_tip.x())}, {int(self.canvas.target_tip.y())})\n\n"
        txt += f"# Physical Params:\n"
        txt += f"radius = {self.canvas.params['radius']}\n"
        txt += f"gravity = ({self.canvas.params['gravity_x']}, {self.canvas.params['gravity_y']})\n"
        txt += f"steps = ({self.canvas.params['steps_p1']}, {self.canvas.params['steps_p2']})"
        self.info_label.setText(txt)

    def copy_code(self):
        QApplication.clipboard().setText(self.info_label.text())
        print("已复制坐标和参数到剪贴板。")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = EditorWindow()
    window.showMaximized()
    sys.exit(app.exec())
