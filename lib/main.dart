import 'dart:io';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_animate/flutter_animate.dart';

//Global
late FragmentProgram currentShader,frag_0,frag_1,frag_2;

double shaderShape = 0.0;

Future<void> main() async {
  frag_0 = await FragmentProgram.fromAsset('shaders/ShaderWorld_0.frag');
  frag_1 = await FragmentProgram.fromAsset('shaders/ShaderWorld_1.frag');
  frag_2 = await FragmentProgram.fromAsset('shaders/ShaderWorld_2.frag');

  sleep(const Duration(seconds: 2));
  currentShader = frag_0;
  sleep(const Duration(seconds: 1));
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  MyAppState createState() => MyAppState();
}

class MyAppState extends State<MyApp> {
  double _time = 0.0; // Store time for the shader
  double posX = 0.0;
  double posY = 0.0;
  int shaderIndex = 0;
  late Ticker _ticker;
  late Size screenSize = MediaQuery.sizeOf(context);

  //Next shader
  Future<void> nextShader(int indexAdd) async {
    shaderIndex += indexAdd;
    if (shaderIndex > 2) {shaderIndex = 0;}
    if (shaderIndex < 0) {shaderIndex = 2;}

    switch (shaderIndex) {
      case 0: currentShader = frag_0; break;
      case 1: currentShader = frag_1; break;
      case 2: currentShader = frag_2; break;
    }
    //Set Shader position to center of canvas at the end of the last frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
        posX = screenSize.width / 2;
        posY = screenSize.width / 2;
    });
  }

  //Change Shader shape
  void changeShaderShape() {
    shaderShape += 1.0;
    if (shaderShape > 3.0) {shaderShape = 0.0;}
    if (shaderShape < 0.0) {shaderShape = 3.0;}
    //Set Shader position to center of canvas at the end of the last frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
        posX = screenSize.width / 2;
        posY = screenSize.width / 2;
    });
  }

  //Get drag position updates
  void onPanUpdate(DragUpdateDetails details) {
      posX = details.localPosition.dx;
      posY = details.localPosition.dy;
  }

  @override
  void initState() {
    super.initState();

    //Update the time every frame
    _ticker = Ticker((elapsed) {
      setState(() {
        _time = elapsed.inMilliseconds / 10000.0;
      });
    })
      ..start();

    //Set Shader position to center of canvas at the end of the last frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
        posX = screenSize.width / 2;
        posY = screenSize.width / 2;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        home: Scaffold(
      appBar: AppBar(
        title: const Text("Shader", style: TextStyle(color: Colors.white))
            .animate()
            .fade(delay: 1000.ms),
        toolbarHeight: 30,
        centerTitle: true,
        backgroundColor: Colors.black,
      ),
      backgroundColor: Colors.black,
      body: Column(children: [
        const Padding(padding: EdgeInsets.all(20.0)),
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          FloatingActionButton(
                  onPressed: () => nextShader(-1),
                  child: const Icon(Icons.arrow_left)),
          const Padding(padding: EdgeInsets.all(10.0)),
          SizedBox(
              width: 180,
              height: 50,
              child: ElevatedButton(
                onPressed: () => changeShaderShape(),
                child: const Text('Change Shape'),
              )),
          const Padding(padding: EdgeInsets.all(10.0)),
          FloatingActionButton(
                  onPressed: () => nextShader(1),
                  child: const Icon(Icons.arrow_right))
        ]).animate()
            .fade(delay: 1250.ms)
            .slide(),
        const Padding(padding: EdgeInsets.all(30.0)),
        SizedBox(
            height: screenSize.height - 300,
            child: Stack(children: [
              CustomPaint(
                size: Size(screenSize.width,screenSize.width),
                painter: MyPainter(
                  shader: currentShader.fragmentShader(),
                  time: _time,
                  posX: posX,
                  posY: posY,
                ),
              ),
              GestureDetector(
                  onPanUpdate: onPanUpdate,
                  child: Container(color: Colors.transparent))
            ])).animate().fadeIn(delay: 1500.ms).shimmer(),
      ]),
    ));
  }
}

class MyPainter extends CustomPainter {
  MyPainter(
      {required this.shader,
      required this.time,
      required this.posX,
      required this.posY});

  //final Color color;
  final FragmentShader shader;
  final double time;
  double posX, posY;

  @override
  void paint(Canvas canvas, Size size) {

    final paint = Paint()..shader = shader;

    //uSize vec2 (0 to 1)
    shader.setFloat(0, size.width);
    shader.setFloat(1, size.height);

    //uTime float (2)
    shader.setFloat(2, time);

    //uTapOffset vec2 (3 - 4)
    shader.setFloat(3, posX);
    shader.setFloat(4, posY);

    //Palette variables (5 - )
    for (int i = 0; i < 3; i ++) {
      shader.setFloat(5 + i, 0.5);//a
      shader.setFloat(8 + i, 0.5);//b
      shader.setFloat(11 + i, 1.0);//c
    }

    //d
    shader.setFloat(14, 0.263);
    shader.setFloat(15, 0.416);
    shader.setFloat(16, 0.557);
    //----

    //index
    shader.setFloat(17, shaderShape);

    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), paint);

  }

  @override
  bool shouldRepaint(MyPainter oldDelegate) => time != oldDelegate.time;
}
