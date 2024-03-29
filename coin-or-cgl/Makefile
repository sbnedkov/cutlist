# Copyright (C) 2006 International Business Machines and others.
# All Rights Reserved.
# This file is distributed under the Eclipse Public License.


##########################################################################
#    You can modify this example makefile to fit for your own program.   #
#    Usually, you only need to change CHANGEME entries below.            #
##########################################################################

# CHANGEME
# To compile other examples, either change the following line, or add the
# argument DRIVER=filename_without_extension to make

DRIVER = cgl1

# CHANGEME
# This should be the name of your executable; change if you want a name
# that's different from the file name.

EXE = $(DRIVER)

# CHANGEME
# OBJS should include all object files necessary to build your program. For
# the examples, only one file is needed for each example. You will probably
# have more as your code grows.

OBJS =  $(DRIVER).o

# CHANGEME
# Additional libraries. The examples require only the COIN-OR libraries specified
# as LIBS below. You may need more.

ADDLIBS = -lCgl -lOsiClp -lOsi -lClpSolver -lClp -lcholmod -lCoinUtils -lbz2 -lz -lglpk -llapack -lblas -lm 

# CHANGEME
# Additional flags for compilation (e.g., include flags). As for libraries,
# the examples require only COIN-OR include files, specified as part of CXXFLAGS
# below.

ADDINCFLAGS = -I/usr/include/coin

# CHANGEME
# Directory to the sources for the (example) problem definition files. VPATH
# is used if you are building in a different directory than the source. This
# can be handy for various reasons; if none occur to you, don't worry about
# it.

SRCDIR = .


##########################################################################
#  Usually, you don't have to change anything below.  Note that if you   #
#  change certain compiler options, you might have to recompile the      #
#  package.                                                              #
##########################################################################

# C++ Compiler command
CXX = g++

# C++ Compiler options
CXXFLAGS = -g -O2

# Sample data directory
@COIN_HAS_SAMPLE_TRUE@CXXFLAGS += -DSAMPLEDIR=\"`$(CYGPATH_W) @SAMPLE_DATA@`\"


# additional C++ Compiler options for linking
# CXXLINKFLAGS = @RPATH_FLAGS@

# Include directories
@COIN_HAS_PKGCONFIG_TRUE@INCL = `PKG_CONFIG_PATH=@COIN_PKG_CONFIG_PATH@ @PKG_CONFIG@ --cflags cgl`
@COIN_HAS_PKGCONFIG_FALSE@INCL = -I${prefix}/include/coin-or
INCL += $(ADDINCFLAGS)

# Linker flags
@COIN_HAS_PKGCONFIG_TRUE@LIBS = `PKG_CONFIG_PATH=@COIN_PKG_CONFIG_PATH@ @PKG_CONFIG@ --libs cgl osi-clp clp osi coinutils`
@COIN_HAS_PKGCONFIG_FALSE@LIBS = -L${exec_prefix}/lib -lCgl -lOsiClp -lClp -lOsi -lCoinUtils
LIBS += $(ADDLIBS)

# The following is necessary under cygwin, if native compilers are used
CYGPATH_W = @CYGPATH_W@

# get some directories, so we can expand ${exec_prefix}/lib and ${prefix}/include
prefix=/usr/local
exec_prefix=${prefix}

all: $(EXE)

.SUFFIXES: .cpp .o

$(EXE): $(OBJS)
	$(CXX) $(CXXLINKFLAGS) $(CXXFLAGS) -o $@ $< $(LIBS)

clean:
	rm -rf $(EXE) $(OBJS)

.cpp.o:
	$(CXX) $(CXXFLAGS) $(INCL) -c -o $@ `test -f '$<' || echo '$(SRCDIR)/'`$<

