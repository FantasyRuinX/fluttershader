import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_animate/flutter_animate.dart';

//Global
late FragmentProgram fragmentProgram;
enum ShaderShape {square,circle}
ShaderShape shaderShape = ShaderShape.square;

Future<void> main() async {
  fragmentProgram =
  await FragmentProgram.fromAsset('shaders/ShaderWorld_0.frag');
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

  //Next shader
  Future<void> nextShader(int indexAdd) async {
    shaderIndex += indexAdd;
    if (shaderIndex < 0 || shaderIndex > 1) {shaderIndex = 0;}

    switch (shaderIndex) {
      case 0 :
        fragmentProgram =
        await FragmentProgram.fromAsset('shaders/ShaderWorld_0.frag');
        break;
      case 1 :
        fragmentProgram =
        await FragmentProgram.fromAsset('shaders/ShaderWorld_1.frag');
        break;
      default : print('Unexpected expected error');

    }
    //Set Shader position to center of canvas at the end of the last frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      setState(() {
        posX = MediaQuery.of(context).size.width / 2;
        posY = MediaQuery.of(context).size.width / 2;
      });
    });

  }
  //Change Shader shape
  void changeShaderShape(){
    setState(() {
      shaderShape = ShaderShape.values[(shaderShape.index + 1) % ShaderShape.values.length];
    });

    //Set Shader position to center of canvas at the end of the last frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      setState(() {
        posX = MediaQuery.of(context).size.width / 2;
        posY = MediaQuery.of(context).size.width / 2;
      });
    });
  }

  //Get drag position updates
  void onPanUpdate(DragUpdateDetails details) {
    setState(() {
      posX = details.localPosition.dx;
      posY = details.localPosition.dy;
    });
  }

  @override
  void initState() {
    super.initState();

    //Update the time every frame
    _ticker = Ticker((elapsed) {
      setState(() {
        _time =
            elapsed.inMilliseconds / 1000.0; // Convert milliseconds to seconds
      });
    })
      ..start();

    //Set Shader position to center of canvas at the end of the last frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      setState(() {
        posX = MediaQuery.of(context).size.width / 2;
        posY = MediaQuery.of(context).size.width / 2;
      });
    });

  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        home: Scaffold(
          appBar: AppBar(title: const Text("Shader").animate().fade(delay: 1000.ms).slide()
              ,toolbarHeight: 30,centerTitle: true,),
          body: Column(children: [

                const Padding(padding: EdgeInsets.all(20.0)),
                Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                FloatingActionButton(
                    onPressed: () => nextShader(-1), child: const Icon(Icons.arrow_left)
                ).animate().fade(delay: 1250.ms).slide(),

                  const Padding(padding: EdgeInsets.all(10.0)),
                  SizedBox(
                    width: 180, height: 50,
                    child : ElevatedButton(
                      onPressed: () => changeShaderShape(),
                      child: const Text('Change Shape'),
                  )).animate(delay: 1250.ms).fade(),
                  const Padding(padding: EdgeInsets.all(10.0)),

                FloatingActionButton(
                    onPressed: () => nextShader(1), child: const Icon(Icons.arrow_right)
                ).animate().fade(delay: 1250.ms).slide(),
                ]),

                const Padding(padding: EdgeInsets.all(30.0)),
                SizedBox(
                  height: MediaQuery.of(context).size.height - 300,
                  child: Stack(children: [
                            CustomPaint(
                            size: Size(MediaQuery.of(context).size.width,
                            MediaQuery.of(context).size.width),
                        painter: MyPainter(
                          Colors.white,
                          shader: fragmentProgram.fragmentShader(),
                          time: _time,
                          posX: posX,
                          posY: posY,
                        ),
                      ),
                      GestureDetector(
                          onPanUpdate: onPanUpdate,
                          child:Container(color: Colors.transparent))
                          ])
              ).animate().fadeIn(delay: 1500.ms).shimmer(),
          ]),
    )
    );
  }
}

class MyPainter extends CustomPainter {
  MyPainter(this.color,
      {required this.shader,
        required this.time,
        required this.posX,
        required this.posY});

  final Color color;
  final FragmentShader shader;
  final double time;
  double posX, posY;

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

    //uTapOffset vec2 (7 - 8)
    shader.setFloat(7, posX);
    shader.setFloat(8, posY);

    canvas.drawRect(Rect.fromLTWH(0, -15, size.width, -10), Paint());

    //Set shader render shape
    switch(shaderShape){
      case ShaderShape.square :
        canvas.drawRect(
           Rect.fromLTWH(0, 0, size.width, size.height), Paint()
         ..shader = shader);
        break;
      case ShaderShape.circle:
        canvas.drawCircle(
            Offset(size.width / 2, size.height / 2),
            (size.width + size.height) / 4, Paint()..shader = shader);
        break;
    }

    canvas.drawRect(Rect.fromLTWH(0,size.height + 10, size.width,15), Paint());


  }

  @override
  bool shouldRepaint(MyPainter oldDelegate) =>
      time != oldDelegate.time ||
          posX != oldDelegate.posX ||
          posY != oldDelegate.posY;
}
