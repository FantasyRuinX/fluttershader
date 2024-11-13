import 'dart:ui';
import 'package:flutter/material.dart';

late FragmentProgram fragmentProgram;

Future<void> main() async{
  fragmentProgram = await FragmentProgram.fromAsset('shaders/FractalWorldStar.frag');
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: CustomPaint(
        painter: MyPainter(
            Colors.green,
            shader: fragmentProgram.fragmentShader(),
        ),
      )
    );
  }
}

class MyPainter extends CustomPainter{
  MyPainter(this.color, {required this.shader});

  final Color color;
  final FragmentShader shader;

  @override
  void paint(Canvas canvas, Size size) {
    //uSize vec2 (0 to 1)
    shader.setFloat(0, size.width);
    shader.setFloat(1, size.height);

    //uColor vec4 (2 - 5)
    shader.setFloat(2, color.red.toDouble() / 255);
    shader.setFloat(3, color.green.toDouble() / 255);
    shader.setFloat(4, color.blue.toDouble() / 255);
    shader.setFloat(5, color.alpha.toDouble() / 255);

    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), Paint()..shader = shader);
  }

  @override
  bool shouldRepaint(MyPainter oldDelegate) => color != oldDelegate.color;
}