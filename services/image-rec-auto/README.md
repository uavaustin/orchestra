# Image-Rec Auto Service

The image-rec service targets a Jetson Xavier device. It is possible to _build_ a 
ARM container (specifially Nvidia's `lt4`) on an x86 device, but the AMD image-rec
application will not be able to _run_ on an x86 platform because `PyTorch` looks for
certain .so files, somthing `qemu` can't workaround.

To circumvent this, the `Makefile` provides the ability to build and test on different
devices. The two images, x86 and ARM, should be very similar; typically if tests pass in
one container, they should pass in the other.

### On x86
To build:

```
make image-rec-auto
```

To build for ARM:
```
make image-rec-auto JETSON=true
```

To test:
```

make image-rec-auto-test
```

### On ARM
To build:

```
make image-rec-auto JETSON=true
```

To test:
```
make image-rec-auto-test JETSON=true
```