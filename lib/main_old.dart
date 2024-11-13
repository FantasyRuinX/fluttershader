import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

late FragmentProgram fragmentProgram;

Future<void> main() async{
  fragmentProgram = await FragmentProgram.fromAsset('shaders/FractalWorldStar.frag');
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  MyAppState createState() => MyAppState();
}

class MyAppState extends State<MyApp> {
  double _time = 0.0; // Store time for the shader
  late Ticker _ticker;

  @override
  void initState() {
    super.initState();
    //Update the time every frame
    _ticker = Ticker((elapsed) {
      setState(() {
        _time = elapsed.inMilliseconds / 1000.0; // Convert milliseconds to seconds
      });
    })..start();
  }

  @override
  Widget build(BuildContext context) {

    return MaterialApp(
        home:
        CustomPaint(
          painter: MyPainter(
            Colors.green,
            shader: fragmentProgram.fragmentShader(),
            time: _time,
          ),
        ),
    );

  }
}

class MyPainter extends CustomPainter{
  MyPainter(this.color, {required this.shader, required this.time});

  final Color color;
  final FragmentShader shader;
  final double time;

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

    //uTime float (6)
    shader.setFloat(6, time);

    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), Paint()..shader = shader);
  }

  @override
  bool shouldRepaint(MyPainter oldDelegate) => time != oldDelegate.time;
}
